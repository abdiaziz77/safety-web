from flask import Blueprint, request, jsonify, session, current_app
from datetime import datetime
from models import Report, ReportMedia, User, db
from utils import admin_required, login_required, notify_new_report, notify_report_status_update, send_report_confirmation_email, send_admin_report_notification
import uuid
import os
from werkzeug.utils import secure_filename
import mimetypes

reports_bp = Blueprint('reports', __name__)

# Configure upload settings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'm4a'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(filename):
    """Determine file type from extension"""
    extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if extension in {'png', 'jpg', 'jpeg', 'gif'}:
        return 'image'
    elif extension in {'mp4', 'mov', 'avi', 'mkv'}:
        return 'video'
    elif extension in {'mp3', 'wav', 'm4a'}:
        return 'audio'
    return 'unknown'

# Media Upload Endpoint
@reports_bp.route('/upload-media', methods=['POST'])
@login_required
def upload_media():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    try:
        # Check if files were uploaded
        if 'media' not in request.files:
            return jsonify({"error": "No files provided"}), 400
        
        files = request.files.getlist('media')
        if not files or files[0].filename == '':
            return jsonify({"error": "No selected files"}), 400
        
        media_urls = []
        upload_dir = os.path.join(current_app.root_path, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        for file in files:
            # Validate file
            if not file or not allowed_file(file.filename):
                continue
            
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > MAX_FILE_SIZE:
                continue
            
            # Generate unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            filepath = os.path.join(upload_dir, unique_filename)
            
            # Save file
            file.save(filepath)
            
            # Determine file type
            file_type = get_file_type(filename)
            
            # Create URL for the file
            media_url = f"/uploads/{unique_filename}"
            
            media_urls.append({
                "url": media_url,
                "type": file_type,
                "name": filename,
                "size": file_size
            })
        
        return jsonify({"mediaUrls": media_urls}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# User Routes
@reports_bp.route('/', methods=['POST'])
@login_required
def create_report():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    data = request.get_json()
    
    required_fields = ['report_type', 'title', 'description', 'area', 'ward']
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
            
            # Garissa County Location Fields
            area=data['area'],
            ward=data['ward'],
            landmark=data.get('landmark'),
            location_type=data.get('location_type', 'public'),
            location_details=data.get('location_details'),
            
            # Personal Information
            anonymous=data.get('anonymous', False),
            full_name=data.get('full_name'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address'),
            
            # Incident Details
            witnesses=data.get('witnesses', False),
            witness_details=data.get('witness_details'),
            evidence_available=data.get('evidence_available', False),
            evidence_details=data.get('evidence_details'),
            police_involved=data.get('police_involved', False),
            police_details=data.get('police_details'),
            
            # Additional Information
            category=data.get('category'),
            subcategory=data.get('subcategory'),
            tags=data.get('tags', []),
            custom_fields=data.get('custom_fields', {})
        )
        
        # Handle media if provided in the request
        media_urls = data.get('media', [])
        for media_info in media_urls:
            media = ReportMedia(
                id=str(uuid.uuid4()),
                report_id=report.id,
                url=media_info['url'],
                type=media_info.get('type', 'unknown'),
                name=media_info.get('name', ''),
                size=media_info.get('size', 0)
            )
            db.session.add(media)
        
        db.session.add(report)
        db.session.commit()
        
        # Notify admins about new report
        notify_new_report(report)
        
        # Send confirmation email to user
        send_report_confirmation_email(
            user_email=user.email,
            user_name=f"{user.first_name} {user.last_name}",
            report_title=report.title,
            report_type=report.report_type
        )
        
        # Send notification to admin
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

@reports_bp.route('/<report_id>', methods=['PUT'])
@login_required
def update_user_report(report_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    try:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404
        
        # Check if user owns the report
        if report.user_id != session['user_id']:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.get_json()
        
        # Debug: Print received data
        current_app.logger.info(f"Received update data: {data}")
        
        # Update allowed fields (users can't change status or admin_notes)
        allowed_fields = [
            'title', 'description', 'urgency', 'area', 'ward', 'landmark',
            'location_type', 'location_details', 'witness_details',
            'evidence_details', 'police_details', 'category', 'subcategory',
            'tags', 'custom_fields', 'report_type'
        ]
        
        for field in allowed_fields:
            if field in data:
                # Handle date field specially if needed
                if field == 'date' and data[field]:
                    try:
                        setattr(report, field, datetime.fromisoformat(data[field].replace('Z', '+00:00')))
                    except (ValueError, TypeError):
                        current_app.logger.error(f"Invalid date format: {data[field]}")
                else:
                    setattr(report, field, data[field])
        
        report.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(report.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating report: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Admin Routes
@reports_bp.route('/admin/reports', methods=['GET'])
@admin_required
def get_all_reports():
    try:
        status = request.args.get('status')
        area = request.args.get('area')
        urgency = request.args.get('urgency')
        
        query = Report.query.order_by(Report.created_at.desc())
        
        if status and status != 'All':
            query = query.filter_by(status=status)
        
        if area and area != 'All':
            query = query.filter_by(area=area)
            
        if urgency and urgency != 'All':
            query = query.filter_by(urgency=urgency)
        
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
            report.admin_id = session.get('user_id')
        
        # Update admin notes if provided
        if 'admin_notes' in data:
            report.admin_notes = data['admin_notes']
        
        # Admins can update any field
        updateable_fields = [
            'title', 'description', 'urgency', 'area', 'ward', 'landmark',
            'location_type', 'location_details', 'witness_details',
            'evidence_details', 'police_details', 'category', 'subcategory',
            'tags', 'custom_fields', 'report_type'
        ]
        
        for field in updateable_fields:
            if field in data:
                setattr(report, field, data[field])
        
        report.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Notify user about status change if updated
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
        report.admin_id = session.get('user_id')
        report.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Notify user about status change
        notify_report_status_update(report, old_status)
        
        return jsonify(report.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Media Upload Route
@reports_bp.route('/<report_id>/media', methods=['POST'])
@login_required
def upload_media_to_report(report_id):
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
        os.makedirs('uploads', exist_ok=True)
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

# Get reports by area (for filtering)
@reports_bp.route('/admin/reports/areas', methods=['GET'])
@admin_required
def get_report_areas():
    try:
        areas = db.session.query(Report.area).distinct().all()
        area_list = [area[0] for area in areas if area[0]]
        return jsonify({'areas': area_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500