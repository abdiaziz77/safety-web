from flask import Blueprint, request, jsonify, session
from datetime import datetime
from models import Report, ReportMedia, User, db
from utils import admin_required, login_required, notify_new_report, notify_report_status_update, send_report_confirmation_email, send_admin_report_notification
import uuid
import os
from werkzeug.utils import secure_filename

reports_bp = Blueprint('reports', __name__)

# User Routes
@reports_bp.route('/', methods=['POST'])
@login_required
def create_report():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    data = request.get_json()
    
    required_fields = ['report_type', 'title', 'description', 'location']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        report = Report(
            id=str(uuid.uuid4()),
            user_id=session['user_id'],
            report_type=data['report_type'],
            title=data['title'],
            description=data['description'],
            date=datetime.fromisoformat(data.get('date', datetime.utcnow().isoformat())),
            time=datetime.fromisoformat(data.get('time', datetime.utcnow().isoformat())),
            urgency=data.get('urgency', 'medium'),
            location=data['location'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            location_type=data.get('location_type', 'public'),
            location_details=data.get('location_details'),
            witnesses=data.get('witnesses', False),
            witness_details=data.get('witness_details'),
            evidence_available=data.get('evidence_available', False),
            evidence_details=data.get('evidence_details'),
            police_involved=data.get('police_involved', False),
            police_details=data.get('police_details')
        )
        
        db.session.add(report)
        db.session.commit()
        
        # ✅ Notify admins about new report
        notify_new_report(report)
        
        # ✅ Send confirmation email to user
        send_report_confirmation_email(
            user_email=user.email,
            user_name=f"{user.first_name} {user.last_name}",
            report_title=report.title,
            report_type=report.report_type
        )
        
        # ✅ Send notification to admin
        send_admin_report_notification(report, user)
        
        return jsonify(report.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/', methods=['GET'])
@login_required
def get_user_reports():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    try:
        reports = Report.query.filter_by(user_id=session['user_id']).order_by(Report.created_at.desc()).all()
        return jsonify({'reports': [report.to_dict() for report in reports]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/<report_id>', methods=['GET'])
@login_required
def get_report(report_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    try:
        report = Report.query.get(report_id)
        
        if not report:
            return jsonify({"error": "Report not found"}), 404
        
        user = User.query.get(session['user_id'])
        if report.user_id != session['user_id'] and not user.is_admin:
            return jsonify({"error": "Unauthorized"}), 403
        
        return jsonify(report.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Admin Routes
@reports_bp.route('/admin/reports', methods=['GET'])
@admin_required
def get_all_reports():
    try:
        status = request.args.get('status')
        query = Report.query.order_by(Report.created_at.desc())
        
        if status and status != 'All':
            query = query.filter_by(status=status)
        
        reports = query.all()
        return jsonify({'reports': [report.to_dict() for report in reports]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/admin/reports/<report_id>', methods=['GET'])
@admin_required
def get_admin_report(report_id):
    try:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404
        return jsonify(report.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/admin/reports/<report_id>', methods=['PUT'])
@admin_required
def update_report(report_id):
    try:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404
        
        data = request.get_json()
        old_status = report.status  # Store old status for notification
        
        # Update status if provided
        if 'status' in data:
            valid_statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed']
            if data['status'] not in valid_statuses:
                return jsonify({"error": "Invalid status"}), 400
            report.status = data['status']
            report.admin_id = session.get('admin_user_id')  # Use admin_user_id
        
        # Update admin notes if provided
        if 'admin_notes' in data:
            report.admin_notes = data['admin_notes']
        
        db.session.commit()
        
        # ✅ Notify user about status change if updated
        if 'status' in data and data['status'] != old_status:
            notify_report_status_update(report, old_status)
        
        return jsonify(report.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/admin/reports/<report_id>', methods=['DELETE'])
@admin_required
def delete_report(report_id):
    try:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404
        
        db.session.delete(report)
        db.session.commit()
        return jsonify({"message": "Report deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/admin/reports/<report_id>/status', methods=['PATCH'])
@admin_required
def update_report_status(report_id):
    try:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404
        
        new_status = request.json.get('status')
        if not new_status:
            return jsonify({"error": "Status is required"}), 400
        
        valid_statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed']
        if new_status not in valid_statuses:
            return jsonify({"error": "Invalid status"}), 400
        
        old_status = report.status  # Store old status for notification
        report.status = new_status
        report.admin_id = session.get('admin_user_id')  # Use admin_user_id
        db.session.commit()
        
        # ✅ Notify user about status change
        notify_report_status_update(report, old_status)
        
        return jsonify(report.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Media Upload Route
@reports_bp.route('/<report_id>/media', methods=['POST'])
@login_required
def upload_media(report_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    try:
        report = Report.query.get(report_id)
        
        if not report:
            return jsonify({"error": "Report not found"}), 404
        
        user = User.query.get(session['user_id'])
        if report.user_id != session['user_id'] and not user.is_admin:
            return jsonify({"error": "Unauthorized"}), 403
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # In a real app, you would upload to S3 or similar
        filename = secure_filename(file.filename)
        filepath = os.path.join('uploads', filename)
        file.save(filepath)
        
        media = ReportMedia(
            id=str(uuid.uuid4()),
            report_id=report_id,
            url=f"/uploads/{filename}",
            type=file.content_type.split('/')[0],  # 'image', 'video', etc.
            name=filename,
            size=os.path.getsize(filepath)
        )
        
        db.session.add(media)
        db.session.commit()
        
        return jsonify(media.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500