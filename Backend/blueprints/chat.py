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
@login_required
def get_chats():
    user_id = session.get("user_id")
    user_role = session.get("user_role")

    if user_role == "admin":
        chats = Chat.query.order_by(Chat.updated_at.desc()).all()
    else:
        chats = Chat.query.filter_by(user_id=int(user_id)).order_by(Chat.updated_at.desc()).all()

    return jsonify([c.to_dict() for c in chats])


# -------------------------
# 📌 Get single chat with messages
# -------------------------
@chat_bp.route("/<chat_id>", methods=["GET"])
@login_required
def get_chat(chat_id):
    user_id = session.get("user_id")
    user_role = session.get("user_role")

    chat = Chat.query.get_or_404(chat_id)

    # Authorization check
    if user_role != "admin" and chat.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify({
        "chat": chat.to_dict(),
        "messages": [m.to_dict() for m in chat.messages.order_by(ChatMessage.created_at.asc()).all()]
    })


# -------------------------
# 📌 Send message to chat
# -------------------------
@chat_bp.route("/<chat_id>/messages", methods=["POST"])
@login_required
def send_message(chat_id):
    user_id = session.get("user_id")
    user_role = session.get("user_role")

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid user id"}), 400

    chat = Chat.query.get_or_404(chat_id)

    # Authorization check
    if user_role != "admin" and chat.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}

    message = ChatMessage(
        id=str(uuid.uuid4()),
        chat_id=chat_id,
        sender_id=user_id,
        content=data.get("content"),
        is_admin=(user_role == "admin"),
        message_type=data.get("message_type", "text"),
        attachment_url=data.get("attachment_url")
    )

    try:
        db.session.add(message)
        db.session.commit()
        return jsonify({"message": "Message sent", "data": message.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# 📌 Mark all messages as read in a chat
# -------------------------
@chat_bp.route("/<chat_id>/read", methods=["PUT"])
@login_required
def mark_read(chat_id):
    user_id = session.get("user_id")
    user_role = session.get("user_role")

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid user id"}), 400

    chat = Chat.query.get_or_404(chat_id)

    if user_role != "admin" and chat.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    unread = chat.messages.filter(
        (ChatMessage.is_read == False) & (ChatMessage.sender_id != user_id)
    ).all()

    for msg in unread:
        msg.is_read = True

    db.session.commit()
    return jsonify({"message": f"{len(unread)} messages marked as read"})


# -------------------------
# 📌 Close chat
# -------------------------
@chat_bp.route("/<chat_id>/close", methods=["PUT"])
@login_required
def close_chat(chat_id):
    user_id = session.get("user_id")
    user_role = session.get("user_role")

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid user id"}), 400

    chat = Chat.query.get_or_404(chat_id)

    if user_role != "admin" and chat.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    chat.status = "closed"
    db.session.commit()
    return jsonify({"message": "Chat closed", "chat": chat.to_dict()})
@chat_bp.route("/admin/verify", methods=["GET"])
@login_required
def verify_admin():
    return jsonify({
        "is_admin": session.get("user_role") == "admin",
        "user_email": session.get("user_email", "Unknown")
    }), 200