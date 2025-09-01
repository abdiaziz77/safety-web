from flask import Blueprint, request, jsonify, session
from models import Chat, ChatMessage, User
from utils import login_required, admin_required
from extensions import db
import uuid

chat_bp = Blueprint("chat", __name__)

# -------------------------
# 📌 Create a new chat (uses session-based auth)
# -------------------------
@chat_bp.route("/", methods=["POST"])
@login_required
def create_chat():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        user_id = int(user_id)  # ensure integer
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid user id"}), 400

    data = request.get_json() or {}

    new_chat = Chat(
        id=str(uuid.uuid4()),
        user_id=user_id,
        admin_id=data.get("admin_id"),
        title=data.get("title", "Support Chat"),
    )

    try:
        db.session.add(new_chat)
        db.session.commit()
        return jsonify({"message": "Chat created", "chat": new_chat.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# 📌 Get all chats (admin sees all, user sees own)
# -------------------------
@chat_bp.route("/", methods=["GET"])
def get_chats():
    # Check if user is admin
    is_admin = session.get("user_role") == "admin" or session.get("admin_user_id") is not None
    user_id = session.get("user_id")
    
    if is_admin:
        # Admin sees all chats ordered by most recent
        chats = Chat.query.order_by(Chat.updated_at.desc()).all()
    elif user_id:
        # User sees only their own chats
        try:
            user_id = int(user_id)
            chats = Chat.query.filter_by(user_id=user_id).order_by(Chat.updated_at.desc()).all()
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid user id"}), 400
    else:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Get unread counts for each chat
    chats_with_unread = []
    for chat in chats:
        chat_dict = chat.to_dict()
        
        # Count unread messages
        if is_admin:
            # For admin, count user messages as unread
            unread_count = ChatMessage.query.filter(
                ChatMessage.chat_id == chat.id,
                ChatMessage.is_read == False,
                ChatMessage.is_admin == False
            ).count()
        else:
            # For user, count admin messages as unread
            unread_count = ChatMessage.query.filter(
                ChatMessage.chat_id == chat.id,
                ChatMessage.is_read == False,
                ChatMessage.is_admin == True
            ).count()
        
        chat_dict['unread_count'] = unread_count
        chats_with_unread.append(chat_dict)
    
    return jsonify(chats_with_unread)


# -------------------------
# 📌 Get single chat with messages (accessible to both user and admin)
# -------------------------
@chat_bp.route("/<chat_id>", methods=["GET"])
def get_chat(chat_id):
    # Check if user is authenticated
    user_id = session.get("user_id")
    is_admin = session.get("user_role") == "admin" or session.get("admin_user_id") is not None
    
    if not user_id and not is_admin:
        return jsonify({"error": "Unauthorized"}), 401

    chat = Chat.query.get_or_404(chat_id)

    # Authorization check
    if not is_admin and chat.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify({
        "chat": chat.to_dict(),
        "messages": [m.to_dict() for m in chat.messages.order_by(ChatMessage.created_at.asc()).all()]
    })
# -------------------------
# 📌 Get unread message count for the logged-in user
# -------------------------
@chat_bp.route("/unread_count", methods=["GET"])
@login_required
def get_user_unread_count():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid user id"}), 400

    # Get all chats of this user
    chats = Chat.query.filter_by(user_id=user_id).all()
    
    total_unread = 0
    for chat in chats:
        # Count messages sent by admin that are unread
        unread_count = ChatMessage.query.filter(
            ChatMessage.chat_id == chat.id,
            ChatMessage.is_read == False,
            ChatMessage.is_admin == True
        ).count()
        total_unread += unread_count
    
    return jsonify({"total_unread_messages": total_unread}), 200


# -------------------------
# 📌 Send message to chat (both user and admin)
# -------------------------
@chat_bp.route("/<chat_id>/messages", methods=["POST"])
def send_message(chat_id):
    # Check if user is authenticated
    user_id = session.get("user_id")
    admin_id = session.get("admin_user_id")
    is_admin = session.get("user_role") == "admin" or admin_id is not None
    
    if not user_id and not admin_id:
        return jsonify({"error": "Unauthorized"}), 401

    chat = Chat.query.get_or_404(chat_id)

    # Authorization check
    if not is_admin and chat.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    if not data.get("content"):
        return jsonify({"error": "Message content is required"}), 400

    # Determine sender ID and admin status
    sender_id = admin_id if is_admin else user_id
    message_is_admin = bool(is_admin)

    message = ChatMessage(
        id=str(uuid.uuid4()),
        chat_id=chat_id,
        sender_id=sender_id,
        content=data.get("content"),
        is_admin=message_is_admin,
        message_type=data.get("message_type", "text"),
        attachment_url=data.get("attachment_url")
    )

    try:
        db.session.add(message)
        # Update chat's updated_at timestamp
        if hasattr(chat, 'touch'):
            chat.touch()
        else:
            chat.updated_at = db.func.now()
        
        db.session.commit()
        return jsonify({"message": "Message sent", "data": message.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# 📌 Mark all messages as read in a chat
# -------------------------
@chat_bp.route("/<chat_id>/read", methods=["PUT"])
def mark_read(chat_id):
    # Check if user is authenticated
    user_id = session.get("user_id")
    is_admin = session.get("user_role") == "admin" or session.get("admin_user_id") is not None
    
    if not user_id and not is_admin:
        return jsonify({"error": "Unauthorized"}), 401

    chat = Chat.query.get_or_404(chat_id)

    # Authorization check
    if not is_admin and chat.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    # Mark appropriate messages as read
    if is_admin:
        # Admin marks user messages as read
        unread_messages = chat.messages.filter(
            ChatMessage.is_read == False,
            ChatMessage.is_admin == False
        ).all()
    else:
        # User marks admin messages as read
        unread_messages = chat.messages.filter(
            ChatMessage.is_read == False,
            ChatMessage.is_admin == True
        ).all()

    for msg in unread_messages:
        msg.is_read = True

    try:
        db.session.commit()
        return jsonify({"message": f"{len(unread_messages)} messages marked as read"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# 📌 Close chat (both user and admin)
# -------------------------
@chat_bp.route("/<chat_id>/close", methods=["PUT"])
def close_chat(chat_id):
    # Check if user is authenticated
    user_id = session.get("user_id")
    is_admin = session.get("user_role") == "admin" or session.get("admin_user_id") is not None
    
    if not user_id and not is_admin:
        return jsonify({"error": "Unauthorized"}), 401

    chat = Chat.query.get_or_404(chat_id)
    
    if chat.status == "closed":
        return jsonify({"error": "Chat is already closed"}), 400

    # Authorization check - users can only close their own chats
    if not is_admin and chat.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    chat.status = "closed"
    
    try:
        db.session.commit()
        return jsonify({"message": "Chat closed", "chat": chat.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# 📌 Reopen chat (admin only)
# -------------------------
@chat_bp.route("/<chat_id>/reopen", methods=["PUT"])
@admin_required
def reopen_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    
    if chat.status == "open":
        return jsonify({"error": "Chat is already open"}), 400

    chat.status = "open"
    
    try:
        db.session.commit()
        return jsonify({"message": "Chat reopened", "chat": chat.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# 📌 Admin verification endpoint
# -------------------------
@chat_bp.route("/admin/verify", methods=["GET"])
@admin_required
def verify_admin():
    admin_id = session.get('admin_user_id')
    user_id = session.get('user_id')
    user_email = session.get('user_email', session.get('admin_user_email', 'Unknown'))
    
    return jsonify({
        "is_admin": True,
        "user_email": user_email,
        "user_id": admin_id or user_id
    }), 200


# -------------------------
# 📌 Get chat statistics for admin dashboard
# -------------------------
@chat_bp.route("/admin/stats", methods=["GET"])
@admin_required
def get_chat_stats():
    open_chats = Chat.query.filter_by(status="open").count()
    closed_chats = Chat.query.filter_by(status="closed").count()
    total_messages = ChatMessage.query.count()
    
    # Count unread messages across all chats
    total_unread_user = ChatMessage.query.filter(
        ChatMessage.is_read == False,
        ChatMessage.is_admin == False
    ).count()
    
    total_unread_admin = ChatMessage.query.filter(
        ChatMessage.is_read == False,
        ChatMessage.is_admin == True
    ).count()
    
    return jsonify({
        "open_chats": open_chats,
        "closed_chats": closed_chats,
        "total_messages": total_messages,
        "total_unread_user": total_unread_user,
        "total_unread_admin": total_unread_admin
    })


# -------------------------
# 📌 Assign chat to admin
# -------------------------
@chat_bp.route("/<chat_id>/assign", methods=["PUT"])
@admin_required
def assign_chat(chat_id):
    admin_id = session.get("admin_user_id")
    if not admin_id:
        return jsonify({"error": "Admin authentication required"}), 401
        
    chat = Chat.query.get_or_404(chat_id)
    chat.admin_id = admin_id
    
    try:
        db.session.commit()
        return jsonify({"message": "Chat assigned", "chat": chat.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# 📌 Get unread message counts for admin
# -------------------------
@chat_bp.route("/admin/unread_counts", methods=["GET"])
@admin_required
def get_unread_counts():
    # Get all open chats with unread messages not sent by admin
    chats = Chat.query.filter_by(status="open").all()
    
    result = {}
    for chat in chats:
        unread_count = ChatMessage.query.filter(
            ChatMessage.chat_id == chat.id,
            ChatMessage.is_read == False,
            ChatMessage.is_admin == False  # Only count user messages as unread for admin
        ).count()
        
        if unread_count > 0:
            result[chat.id] = unread_count
    
    return jsonify(result)


# -------------------------
# 📌 Get messages since specific timestamp (for real-time updates)
# -------------------------
@chat_bp.route("/<chat_id>/messages/since/<timestamp>", methods=["GET"])
def get_messages_since(chat_id, timestamp):
    # Check if user is authenticated
    user_id = session.get("user_id")
    is_admin = session.get("user_role") == "admin" or session.get("admin_user_id") is not None
    
    if not user_id and not is_admin:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        from datetime import datetime
        since_date = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"error": "Invalid timestamp format"}), 400
    
    chat = Chat.query.get_or_404(chat_id)
    
    # Authorization check
    if not is_admin and chat.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403
    
    messages = chat.messages.filter(
        ChatMessage.created_at >= since_date
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return jsonify([m.to_dict() for m in messages])

# Add this to your chat_bp blueprint
@chat_bp.route("/<chat_id>", methods=["DELETE"])
@admin_required
def delete_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    
    try:
        # First delete all messages in the chat
        ChatMessage.query.filter_by(chat_id=chat_id).delete()
        
        # Then delete the chat itself
        db.session.delete(chat)
        db.session.commit()
        
        return jsonify({"message": "Chat deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500