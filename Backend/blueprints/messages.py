from flask import Blueprint, request, jsonify, session
from models import db, Message, User, Notification, NotificationType, SentEmail
from datetime import datetime
import uuid
from utils import admin_required, send_message_confirmation_email, send_admin_reply_email, get_current_user_id, is_admin

messages_bp = Blueprint('messages', __name__)

# ----------------- Message Routes -----------------

# Get all messages (admin only)
@messages_bp.route('/messages', methods=['GET'])
@admin_required
def get_messages():
    status = request.args.get('status')
    priority = request.args.get('priority')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Message.query

    if status:
        query = query.filter(Message.status == status)
    if priority:
        query = query.filter(Message.priority == priority)

    messages = query.order_by(Message.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'messages': [message.to_dict() for message in messages.items],
        'total': messages.total,
        'pages': messages.pages,
        'current_page': page
    })

# Get single message (admin or message owner)
@messages_bp.route('/messages/<message_id>', methods=['GET'])
def get_message(message_id):
    message = Message.query.get_or_404(message_id)
    
    # Check if user is admin or message owner
    current_user_id = get_current_user_id()
    if not is_admin() and message.user_id != current_user_id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify(message.to_dict())

# Create new message (no auth required for contact form)
@messages_bp.route('/messages', methods=['POST'])
def create_message():
    data = request.get_json()
    
    required_fields = ['email', 'title', 'message']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Check if user exists with this email
    user = User.query.filter_by(email=data['email']).first()
    
    message = Message(
        id=str(uuid.uuid4()),
        email=data['email'],
        title=data['title'],
        message=data['message'],
        user_id=user.id if user else None,
        priority=data.get('priority', 'normal')
    )

    db.session.add(message)
    db.session.commit()

    # Send confirmation email to user
    send_message_confirmation_email(
        data['email'], 
        data['title'], 
        data['message']
    )

    # Create notification for admins
    admins = User.query.filter_by(is_admin=True).all()
    for admin in admins:
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=admin.id,
            type=NotificationType.NEW_MESSAGE,
            title='New Customer Message',
            message=f'New message from {data["email"]}: {data["title"]}',
            is_urgent=data.get('priority') in ['high', 'urgent'],
            role='admin',
            action_url=f'/admin/messages/{message.id}'
        )
        db.session.add(notification)

    db.session.commit()

    return jsonify({
        'message': 'Message sent successfully',
        'message_id': message.id
    }), 201

# Admin reply to message
@messages_bp.route('/messages/reply', methods=['POST'])
@admin_required
def reply_to_message():
    data = request.get_json()
    message_id = data.get('message_id')
    user_email = data.get('user_email')
    reply_text = data.get('reply_text')

    if not all([message_id, user_email, reply_text]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Update message with response
    message = Message.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404

    admin_user = get_current_user_id()
    admin_name = "SafeZone101 Team"

    message.response = reply_text
    message.response_date = datetime.utcnow()
    message.response_admin_id = get_current_user_id()
    message.status = 'resolved'
    message.updated_at = datetime.utcnow()

    # Send email reply to user
    if send_admin_reply_email(user_email, admin_name, message.title, reply_text):
        # Store sent email in database
        sent_email = SentEmail(
            recipient=user_email,
            subject=f"Re: {message.title} - SafeZone101 Response",
            message=reply_text
        )
        db.session.add(sent_email)
        
        db.session.commit()
        return jsonify({'message': 'Reply sent successfully via email'})
    else:
        db.session.rollback()
        return jsonify({'error': 'Failed to send email reply'}), 500

# Update message status
@messages_bp.route('/messages/<message_id>', methods=['PUT'])
@admin_required
def update_message(message_id):
    message = Message.query.get_or_404(message_id)
    data = request.get_json()

    if 'status' in data:
        message.status = data['status']
    if 'priority' in data:
        message.priority = data['priority']
    if 'assigned_admin_id' in data:
        message.assigned_admin_id = data['assigned_admin_id']

    message.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(message.to_dict())

# Delete message (admin only)
@messages_bp.route('/messages/<message_id>', methods=['DELETE'])
@admin_required
def delete_message(message_id):
    message = Message.query.get_or_404(message_id)
    db.session.delete(message)
    db.session.commit()

    return jsonify({'message': 'Message deleted successfully'})

# Get user's messages
@messages_bp.route('/user/messages', methods=['GET'])
def get_user_messages():
    current_user_id = get_current_user_id()
    if not current_user_id:
        return jsonify({'error': 'Login required'}), 401
    
    current_user = User.query.get(current_user_id)
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    messages = Message.query.filter(
        (Message.user_id == current_user_id) | 
        (Message.email == current_user.email)
    ).order_by(Message.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'messages': [message.to_dict() for message in messages.items],
        'total': messages.total,
        'pages': messages.pages,
        'current_page': page
    })

# Get message statistics (admin only)
@messages_bp.route('/messages/stats', methods=['GET'])
@admin_required
def get_message_stats():
    stats = {
        'total': Message.query.count(),
        'new': Message.query.filter_by(status='new').count(),
        'in_progress': Message.query.filter_by(status='in_progress').count(),
        'resolved': Message.query.filter_by(status='resolved').count(),
        'closed': Message.query.filter_by(status='closed').count(),
        'urgent': Message.query.filter_by(priority='urgent').count(),
        'high': Message.query.filter_by(priority='high').count(),
    }

    return jsonify(stats)