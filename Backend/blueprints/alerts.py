from flask import Blueprint, request, jsonify, session, current_app
from datetime import datetime
from models import Alert, User, db
from utils import admin_required, login_required, notify_new_alert, send_alert_notification_email
import uuid

alerts_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

def parse_datetime_safe(dt_str):
    """Helper: safely parse ISO datetime, even without seconds."""
    try:
        return datetime.fromisoformat(dt_str)
    except Exception:
        try:
            return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M")
        except Exception:
            return None

@alerts_bp.before_app_request
def cleanup_expired_alerts():
    """
    Automatically delete expired alerts before processing any request.
    Expired alerts are those with end_date in the past.
    """
    try:
        current_time = datetime.utcnow()
        expired_count = Alert.query.filter(
            Alert.end_date.isnot(None),
            Alert.end_date <= current_time
        ).delete()
        db.session.commit()
        if expired_count > 0:
            current_app.logger.info(f"Cleaned up {expired_count} expired alerts")
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error cleaning up expired alerts: {str(e)}")

# Frontend Routes
@alerts_bp.route('/live', methods=['GET'])
def get_live_alerts():
    """Get all active alerts (not resolved or expired)"""
    try:
        current_time = datetime.utcnow()
        alerts = Alert.query.filter(
            (Alert.status == 'Active') | (Alert.status == 'Critical'),
            (Alert.end_date == None) | (Alert.end_date > current_time)
        ).order_by(Alert.created_at.desc()).all()
        return jsonify({'alerts': [alert.to_dict() for alert in alerts]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/resolved', methods=['GET'])
def get_resolved_alerts():
    """Get all resolved alerts"""
    try:
        alerts = Alert.query.filter(
            Alert.status == 'Resolved'
        ).order_by(Alert.created_at.desc()).all()
        return jsonify({'alerts': [alert.to_dict() for alert in alerts]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Routes
@alerts_bp.route('/admin/alerts', methods=['GET'])
@admin_required
def get_all_alerts():
    try:
        status = request.args.get('status')
        query = Alert.query.order_by(Alert.created_at.desc())
        
        if status and status != 'All':
            query = query.filter_by(status=status)
            
        alerts = query.all()
        return jsonify({'alerts': [alert.to_dict() for alert in alerts]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/admin/alerts', methods=['POST'])
@admin_required
def create_alert():
    current_user_id = session.get('admin_user_id')
    data = request.get_json()
    
    required_fields = ['title', 'message', 'type', 'status', 'severity']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        start_dt = parse_datetime_safe(data.get('start_date')) or datetime.utcnow()
        end_dt = parse_datetime_safe(data.get('end_date')) if data.get('end_date') else None

        alert = Alert(
            id=str(uuid.uuid4()),
            title=data['title'],
            message=data['message'],
            type=data['type'],
            status=data['status'],
            severity=data['severity'],
            affected_area=data.get('affected_area'),
            start_date=start_dt,
            end_date=end_dt,
            created_by=current_user_id
        )
        
        db.session.add(alert)
        db.session.commit()
        
        # Notify all users about the new alert (in-app notifications + emails)
        notify_new_alert(alert)
        
        return jsonify(alert.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/admin/alerts/<alert_id>', methods=['GET'])
@admin_required
def get_alert(alert_id):
    try:
        alert = Alert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        return jsonify(alert.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/admin/alerts/<alert_id>', methods=['PUT'])
@admin_required
def update_alert(alert_id):
    try:
        alert = Alert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
            
        data = request.get_json()
        
        old_status = alert.status  # Store old status
        
        alert.title = data.get('title', alert.title)
        alert.message = data.get('message', alert.message)
        alert.type = data.get('type', alert.type)
        alert.status = data.get('status', alert.status)
        alert.severity = data.get('severity', alert.severity)
        alert.affected_area = data.get('affected_area', alert.affected_area)
        alert.location = data.get('location', alert.location)
        
        if 'start_date' in data and data['start_date']:
            alert.start_date = parse_datetime_safe(data['start_date'])
        if 'end_date' in data:
            alert.end_date = parse_datetime_safe(data['end_date']) if data['end_date'] else None
        
        db.session.commit()
        
        # Notify users if alert status changed to Active or Critical
        if 'status' in data and data['status'] != old_status and data['status'] in ['Active', 'Critical']:
            notify_new_alert(alert)
        
        return jsonify(alert.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/admin/alerts/<alert_id>/status', methods=['PATCH'])
@admin_required
def update_alert_status(alert_id):
    try:
        alert = Alert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
            
        new_status = request.json.get('status')
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
            
        valid_statuses = ['Active', 'Inactive', 'Resolved', 'Critical']
        if new_status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        old_status = alert.status  # Store old status    
        alert.status = new_status
        db.session.commit()
        
        # Notify users if alert status changed to Active or Critical
        if new_status != old_status and new_status in ['Active', 'Critical']:
            notify_new_alert(alert)
        
        return jsonify(alert.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/admin/alerts/<alert_id>', methods=['DELETE'])
@admin_required
def delete_alert(alert_id):
    try:
        alert = Alert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
            
        db.session.delete(alert)
        db.session.commit()
        return jsonify({'message': 'Alert deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/admin/alerts/<alert_id>/notify', methods=['POST'])
@admin_required
def send_alert_notification(alert_id):
    """Manually trigger email notifications for an existing alert"""
    try:
        alert = Alert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
            
        # Send email notifications to all users
        result = send_alert_notification_email(alert)
        
        return jsonify({
            'message': f'Alert notifications sent successfully',
            'stats': result,
            'alert': alert.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500