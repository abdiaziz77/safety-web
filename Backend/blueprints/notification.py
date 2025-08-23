# routes/notifications.py
from flask import Blueprint, request, jsonify, session
from utils import login_required, admin_required
from models import db, Notification, NotificationType, User, Report, Chat, ChatMessage
from datetime import datetime, timedelta

notifications_bp = Blueprint('notifications', __name__)

# ------------------ USER NOTIFICATIONS ------------------
@notifications_bp.route('/user', methods=['GET'])
@login_required
def get_user_notifications():
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({'error': 'User not logged in'}), 401

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        query = Notification.query.filter_by(user_id=user_id)
        if unread_only:
            query = query.filter_by(is_read=False)
        
        notifications = query.order_by(
            Notification.is_urgent.desc(),
            Notification.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'notifications': [n.to_dict() for n in notifications.items],
            'total': notifications.total,
            'pages': notifications.pages,
            'current_page': page,
            'unread_count': Notification.query.filter_by(
                user_id=user_id,
                is_read=False
            ).count()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------ ADMIN NOTIFICATIONS ------------------
@notifications_bp.route('/admin', methods=['GET'])
@admin_required
def get_admin_notifications():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        notification_type = request.args.get('type')
        
        query = Notification.query
        if notification_type:
            try:
                nt = NotificationType(notification_type)
                query = query.filter_by(type=nt)
            except ValueError:
                return jsonify({'error': 'Invalid notification type'}), 400
        
        notifications = query.order_by(
            Notification.is_urgent.desc(),
            Notification.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'notifications': [n.to_dict() for n in notifications.items],
            'total': notifications.total,
            'pages': notifications.pages,
            'current_page': page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------ MARK NOTIFICATIONS ------------------
@notifications_bp.route('/<notification_id>/read', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    try:
        user_id = session.get("user_id")
        user = User.query.get(user_id)

        notification = Notification.query.get_or_404(notification_id)
        if notification.user_id != user_id and not (user and user.is_admin):
            return jsonify({'error': 'Unauthorized'}), 403
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'success': True, 'notification': notification.to_dict()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/read-all', methods=['POST'])
@login_required
def mark_all_notifications_read():
    try:
        user_id = session.get("user_id")
        Notification.query.filter_by(user_id=user_id, is_read=False).update(
            {'is_read': True},
            synchronize_session=False
        )
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------ SEND ADMIN ALERT ------------------
@notifications_bp.route('/admin/send-alert', methods=['POST'])
@admin_required
def send_admin_alert():
    try:
        data = request.get_json()
        title = data.get('title')
        message = data.get('message')
        is_urgent = data.get('is_urgent', False)
        user_ids = data.get('user_ids', [])  # Empty = all users
        
        if not title or not message:
            return jsonify({'error': 'Title and message are required'}), 400
        
        if user_ids:
            users = User.query.filter(User.id.in_(user_ids), User.is_admin == False).all()
        else:
            users = User.query.filter_by(is_admin=False).all()
        
        notifications_created = 0
        for target in users:
            notification = Notification(
                user_id=target.id,
                type=NotificationType.ADMIN_ALERT,
                title=title,
                message=message,
                is_urgent=is_urgent,
                action_url='/alerts',
                action_text='View Alerts',
                created_at=datetime.utcnow()
            )
            db.session.add(notification)
            notifications_created += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Alert sent to {notifications_created} users',
            'notifications_sent': notifications_created
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ------------------ HELPERS: CREATE NOTIFICATIONS ------------------
def create_report_status_notification(report_id, old_status, new_status, admin_id=None):
    try:
        report = Report.query.get_or_404(report_id)
        notification = Notification(
            user_id=report.user_id,
            type=NotificationType.REPORT_STATUS_UPDATE,
            title='Report Status Updated',
            message=f"Your report \"{report.title}\" status changed from {old_status} to {new_status}",
            report_id=report_id,
            action_url=f'/reports/{report_id}',
            action_text='View Report',
            related_user_id=admin_id,
            created_at=datetime.utcnow()
        )
        db.session.add(notification)
        db.session.commit()
        return True
    except Exception as e:
        print(f"Error creating report status notification: {e}")
        db.session.rollback()
        return False


def create_new_report_notification(report_id):
    try:
        report = Report.query.get_or_404(report_id)
        admins = User.query.filter_by(is_admin=True).all()
        
        for admin in admins:
            notification = Notification(
                user_id=admin.id,
                type=NotificationType.NEW_REPORT,
                title='New Report Submitted',
                message=f'New report \"{report.title}\" submitted by {report.author.first_name} {report.author.last_name}',
                report_id=report_id,
                action_url=f'/admin/reports/{report_id}',
                action_text='Review Report',
                related_user_id=report.user_id,
                is_urgent=(report.urgency in ['high', 'critical']),
                created_at=datetime.utcnow()
            )
            db.session.add(notification)
        
        db.session.commit()
        return True
    except Exception as e:
        print(f"Error creating new report notification: {e}")
        db.session.rollback()
        return False


def create_new_user_notification(user_id):
    try:
        user = User.query.get_or_404(user_id)
        admins = User.query.filter_by(is_admin=True).all()
        
        for admin in admins:
            notification = Notification(
                user_id=admin.id,
                type=NotificationType.NEW_USER,
                title='New User Registered',
                message=f'New user registered: {user.first_name} {user.last_name} ({user.email})',
                related_user_id=user_id,
                action_url=f'/admin/users/{user_id}',
                action_text='View User',
                created_at=datetime.utcnow()
            )
            db.session.add(notification)
        
        db.session.commit()
        return True
    except Exception as e:
        print(f"Error creating new user notification: {e}")
        db.session.rollback()
        return False


def create_chat_message_notification(chat_id, message_id, sender_id):
    try:
        chat = Chat.query.get_or_404(chat_id)
        message = ChatMessage.query.get_or_404(message_id)
        
        recipient_id = chat.admin_id if sender_id == chat.user_id else chat.user_id
        if recipient_id:
            notification = Notification(
                user_id=recipient_id,
                type=NotificationType.CHAT_MESSAGE,
                title='New Message',
                message=f'New message in chat: {message.content[:100]}...',
                chat_id=chat_id,
                action_url=f'/chat/{chat_id}',
                action_text='Open Chat',
                related_user_id=sender_id,
                created_at=datetime.utcnow()
            )
            db.session.add(notification)
            db.session.commit()
            return True
    except Exception as e:
        print(f"Error creating chat message notification: {e}")
        db.session.rollback()
        return False


# ------------------ NOTIFICATION STATS ------------------
@notifications_bp.route('/stats', methods=['GET'])
@admin_required
def get_notification_stats():
    try:
        stats = {
            'total': Notification.query.count(),
            'unread': Notification.query.filter_by(is_read=False).count(),
            'urgent': Notification.query.filter_by(is_urgent=True, is_read=False).count(),
            'by_type': {}
        }
        
        for notification_type in NotificationType:
            count = Notification.query.filter_by(type=notification_type).count()
            stats['by_type'][notification_type.value] = count
        
        week_ago = datetime.utcnow() - timedelta(days=7)
        stats['recent'] = Notification.query.filter(
            Notification.created_at >= week_ago
        ).count()
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
