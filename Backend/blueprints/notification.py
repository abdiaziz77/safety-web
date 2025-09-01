from flask import Blueprint, request, jsonify
from models import db, Notification, NotificationType
from utils import (
    login_required,
    admin_required,
    get_current_user_id,
    get_unread_count,
    get_user_notifications,
    mark_notification_as_read,
    mark_all_notifications_read,
    delete_notification,
    is_admin
)

notifications_bp = Blueprint('notifications', __name__)

# ---------------- USER ROUTES ---------------- #

# Get user notifications
@notifications_bp.route('/', methods=['GET'])
@login_required
def get_notifications():
    user_id = get_current_user_id()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'

    query = Notification.query.filter_by(user_id=user_id)
    if unread_only:
        query = query.filter_by(is_read=False)
    
    notifications = query.order_by(Notification.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'notifications': [n.to_dict() for n in notifications.items],
        'total': notifications.total,
        'unread_count': get_unread_count(user_id),
        'pages': notifications.pages,
        'current_page': page
    })


# Get user notification statistics
@notifications_bp.route('/stats', methods=['GET'])
@login_required
def get_notification_stats():
    user_id = get_current_user_id()
    
    stats = {
        'total': Notification.query.filter_by(user_id=user_id).count(),
        'unread': get_unread_count(user_id),
        'urgent': Notification.query.filter_by(user_id=user_id, is_urgent=True, is_read=False).count(),
        'by_type': {
            'report_status_update': Notification.query.filter_by(
                user_id=user_id, type=NotificationType.REPORT_STATUS_UPDATE
            ).count(),
            'admin_alert': Notification.query.filter_by(
                user_id=user_id, type=NotificationType.ADMIN_ALERT
            ).count(),
            'new_report': Notification.query.filter_by(
                user_id=user_id, type=NotificationType.NEW_REPORT
            ).count(),
            'new_message': Notification.query.filter_by(
                user_id=user_id, type=NotificationType.NEW_MESSAGE
            ).count(),
            'emergency': Notification.query.filter_by(
                user_id=user_id, type=NotificationType.EMERGENCY
            ).count()
        }
    }
    
    return jsonify(stats)


# Mark notification as read
@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
@login_required
def mark_as_read(notification_id):
    user_id = get_current_user_id()
    if mark_notification_as_read(notification_id, user_id):
        return jsonify({'message': 'Notification marked as read'})
    return jsonify({'error': 'Notification not found'}), 404


# Mark all notifications as read
@notifications_bp.route('/read-all', methods=['PUT'])
@login_required
def mark_all_as_read():
    user_id = get_current_user_id()
    mark_all_notifications_read(user_id)
    return jsonify({'message': 'All notifications marked as read'})


# Delete notification
@notifications_bp.route('/<notification_id>', methods=['DELETE'])
@login_required
def delete_notification_route(notification_id):
    user_id = get_current_user_id()
    if delete_notification(notification_id, user_id):
        return jsonify({'message': 'Notification deleted'})
    return jsonify({'error': 'Notification not found'}), 404


# Get unread notifications count
@notifications_bp.route('/unread-count', methods=['GET'])
@login_required
def get_unread_count_route():
    user_id = get_current_user_id()
    return jsonify({'unread_count': get_unread_count(user_id)})


# Get recent notifications
@notifications_bp.route('/recent', methods=['GET'])
@login_required
def get_recent_notifications():
    user_id = get_current_user_id()
    limit = request.args.get('limit', 10, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    
    notifications = get_user_notifications(user_id, unread_only, limit)
    
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': get_unread_count(user_id)
    })


# Delete all read notifications
@notifications_bp.route('/delete-read', methods=['DELETE'])
@login_required
def delete_all_read():
    user_id = get_current_user_id()
    Notification.query.filter_by(user_id=user_id, is_read=True).delete()
    db.session.commit()
    return jsonify({'message': 'All read notifications deleted'})


# ---------------- ADMIN ROUTES ---------------- #

# Get ALL system notifications (admin only)
@notifications_bp.route('/admin', methods=['GET'])
@admin_required
def get_admin_notifications():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'

    query = Notification.query
    if unread_only:
        query = query.filter_by(is_read=False)

    notifications = query.order_by(Notification.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'notifications': [n.to_dict() for n in notifications.items],
        'total': notifications.total,
        'pages': notifications.pages,
        'current_page': page
    })


# Get admin notification statistics
@notifications_bp.route('/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    stats = {
        'total': Notification.query.count(),
        'unread': Notification.query.filter_by(is_read=False).count(),
        'urgent': Notification.query.filter_by(is_urgent=True, is_read=False).count(),
        'by_type': {
            nt.value: Notification.query.filter_by(type=nt).count()
            for nt in NotificationType
        }
    }
    return jsonify(stats)


# Mark admin notification as read
@notifications_bp.route('/admin/<notification_id>/read', methods=['PUT'])
@admin_required
def mark_admin_notification_read(notification_id):
    notification = Notification.query.filter_by(id=notification_id).first()
    if notification:
        notification.is_read = True
        db.session.commit()
        return jsonify({'message': 'Notification marked as read'})
    return jsonify({'error': 'Notification not found'}), 404


# Delete admin notification
@notifications_bp.route('/admin/<notification_id>', methods=['DELETE'])
@admin_required
def delete_admin_notification(notification_id):
    notification = Notification.query.filter_by(id=notification_id).first()
    if notification:
        db.session.delete(notification)
        db.session.commit()
        return jsonify({'message': 'Notification deleted'})
    return jsonify({'error': 'Notification not found'}), 404
