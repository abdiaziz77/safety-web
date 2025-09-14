from flask import Blueprint, request, jsonify, current_app
from extensions import db, mail
from models import ContactMessage, User, Notification, NotificationType
from datetime import datetime
import uuid
from flask_mail import Message
import os

contact_bp = Blueprint('contact', __name__)

def send_email_notification(to_email, subject, html_content):
    """Send email notification to user"""
    try:
        msg = Message(
            subject=subject,
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'Safezonee101@gmail.com'),
            recipients=[to_email],
            html=html_content
        )
        mail.send(msg)
        current_app.logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

@contact_bp.route('/', methods=['POST'])
def contact_submission():
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        ticket_number = 'TKT-' + str(int(datetime.now().timestamp())) + '-' + str(uuid.uuid4())[:5].upper()
        
        user = User.query.filter_by(email=data['email']).first()
        user_id = user.id if user else None
        
        contact_message = ContactMessage(
            name=data['name'],
            email=data['email'],
            subject=data['subject'],
            message=data['message'],
            ticket_number=ticket_number,
            user_id=user_id,
            status="new",
            created_at=datetime.utcnow()
        )
        
        db.session.add(contact_message)
        db.session.commit()
        
        # Send confirmation email to user
        send_email_notification(
            data['email'],
            f"Ticket #{ticket_number} Created - SafeZone101 Kenya",
            f"""
            <h2>Thank You for Contacting SafeZone101 Kenya</h2>
            <p>Dear {data['name']},</p>
            <p>We have received your message and created a ticket for your request.</p>
            <p><strong>Ticket Number:</strong> {ticket_number}</p>
            <p><strong>Subject:</strong> {data['subject']}</p>
            <p><strong>Message:</strong><br>{data['message']}</p>
            <p>Our team will review your message and get back to you soon.</p>
            <p>You can check the status of your ticket at any time using your ticket number.</p>
            <br>
            <p>Best regards,<br>SafeZone101 Kenya Team</p>
            """
        )
        
        # Notify admin users
        admin_users = User.query.filter_by(is_admin=True).all()
        for admin in admin_users:
            notification = Notification(
                user_id=admin.id,
                type=NotificationType.NEW_MESSAGE,
                title='New Contact Message',
                message=f'New contact message from {data["name"]} ({data["email"]}): {data["subject"]}',
                is_urgent=data.get('subject') in ['Emergency', 'Urgent'],
                action_url=f'/admin/contact/{contact_message.id}',
                action_text='View Message',
                role='admin'
            )
            db.session.add(notification)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Contact message submitted successfully',
            'ticket_number': ticket_number,
            'id': contact_message.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/messages', methods=['GET'])
def get_contact_messages():
    try:
        messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
        return jsonify([msg.to_dict() for msg in messages]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/messages/<int:message_id>', methods=['GET'])
def get_contact_message(message_id):
    try:
        message = ContactMessage.query.get_or_404(message_id)
        return jsonify(message.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/messages/<int:message_id>', methods=['PUT'])
def update_contact_message(message_id):
    try:
        message = ContactMessage.query.get_or_404(message_id)
        data = request.get_json()
        
        old_status = message.status
        
        if 'status' in data:
            message.status = data['status']
        if 'priority' in data:
            message.priority = data['priority']
        if 'assigned_admin_id' in data:
            message.assigned_admin_id = data['assigned_admin_id']
        if 'response' in data:
            message.response = data['response']
            message.response_date = datetime.utcnow()
            message.response_admin_id = data.get('response_admin_id')
            
            # Send notification email to user about the response
            if data['response']:
                send_email_notification(
                    message.email,
                    f"Update on Your Ticket #{message.ticket_number}",
                    f"""
                    <h2>Update on Your Ticket #{message.ticket_number}</h2>
                    <p>Dear {message.name},</p>
                    <p>There's an update on your ticket with subject "{message.subject}".</p>
                    <p><strong>Admin Response:</strong><br>{data['response']}</p>
                    <p><strong>Status:</strong> {message.status.replace('_', ' ').title()}</p>
                    <p>If you have any further questions, please don't hesitate to contact us again.</p>
                    <br>
                    <p>Best regards,<br>SafeZone101 Kenya Team</p>
                    """
                )
        
        message.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Send status change notification
        if 'status' in data and old_status != data['status']:
            if data['status'] == 'resolved':
                send_email_notification(
                    message.email,
                    f"Your Ticket #{message.ticket_number} Has Been Resolved",
                    f"""
                    <h2>Ticket Resolution Notification</h2>
                    <p>Dear {message.name},</p>
                    <p>We're pleased to inform you that your ticket #{message.ticket_number} with subject "{message.subject}" has been resolved.</p>
                    <p>If you have any further questions or concerns, please don't hesitate to contact us again.</p>
                    <br>
                    <p>Best regards,<br>SafeZone101 Kenya Team</p>
                    """
                )
        
        return jsonify(message.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/messages/<int:message_id>', methods=['DELETE'])
def delete_contact_message(message_id):
    try:
        message = ContactMessage.query.get_or_404(message_id)
        
        # Send deletion notification email to user
        send_email_notification(
            message.email,
            f"Your Ticket #{message.ticket_number} Has Been Processed",
            f"""
            <h2>Ticket Processing Complete</h2>
            <p>Dear {message.name},</p>
            <p>Your ticket #{message.ticket_number} with subject "{message.subject}" has been processed and closed by our team.</p>
            <p>If you have any further questions or concerns, please don't hesitate to contact us again.</p>
            <br>
            <p>Best regards,<br>SafeZone101 Kenya Team</p>
            """
        )
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({'message': 'Contact message deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_contact_messages(user_id):
    try:
        messages = ContactMessage.query.filter_by(user_id=user_id)\
            .order_by(ContactMessage.created_at.desc()).all()
        return jsonify([msg.to_dict() for msg in messages]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/stats', methods=['GET'])
def get_contact_stats():
    try:
        total_messages = ContactMessage.query.count()
        new_messages = ContactMessage.query.filter_by(status='new').count()
        in_progress_messages = ContactMessage.query.filter_by(status='in_progress').count()
        resolved_messages = ContactMessage.query.filter_by(status='resolved').count()
        reopened_messages = ContactMessage.query.filter_by(status='reopened').count()
        
        return jsonify({
            'total': total_messages,
            'new': new_messages,
            'in_progress': in_progress_messages,
            'resolved': resolved_messages,
            'reopened': reopened_messages
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/reopen/<int:message_id>', methods=['POST'])
def reopen_ticket(message_id):
    try:
        message = ContactMessage.query.get_or_404(message_id)
        data = request.get_json()
        
        message.status = "reopened"
        message.updated_at = datetime.utcnow()
        
        if data.get("message"):
            message.response = (message.response or "") + f"\n[Reopened]: {data['message']}"
        
        db.session.commit()
        
        # Send reopening notification to user
        send_email_notification(
            message.email,
            f"Your Ticket #{message.ticket_number} Has Been Reopened",
            f"""
            <h2>Ticket Reopened</h2>
            <p>Dear {message.name},</p>
            <p>Your ticket #{message.ticket_number} with subject "{message.subject}" has been reopened.</p>
            <p><strong>Additional Information:</strong><br>{data.get('message', 'No additional information provided.')}</p>
            <p>Our team will review your request and get back to you soon.</p>
            <br>
            <p>Best regards,<br>SafeZone101 Kenya Team</p>
            """
        )
        
        return jsonify({
            "message": f"Ticket {message.ticket_number} has been reopened",
            "ticket_number": message.ticket_number,
            "id": message.id,
            "status": message.status
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/check-tickets', methods=['POST'])
def check_tickets():
    try:
        data = request.get_json()
        ticket_ids = data.get('ticket_ids', [])
        
        # Check which tickets still exist
        existing_tickets = []
        for ticket_id in ticket_ids:
            ticket = ContactMessage.query.get(ticket_id)
            if ticket:
                existing_tickets.append(ticket_id)
        
        return jsonify({'existing_tickets': existing_tickets}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW ENDPOINT: Get ticket status by ticket number (UUID)
@contact_bp.route('/status-by-number/<string:ticket_number>', methods=['GET'])
def ticket_status_by_number(ticket_number):
    try:
        ticket = ContactMessage.query.filter_by(ticket_number=ticket_number).first_or_404()
        
        return jsonify({
            'ticket_number': ticket.ticket_number,
            'status': ticket.status,
            'response': ticket.response,
            'response_date': ticket.response_date.isoformat() if ticket.response_date else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/status/<int:ticket_id>', methods=['GET'])
def ticket_status(ticket_id):
    try:
        ticket = ContactMessage.query.get_or_404(ticket_id)
        
        return jsonify({
            'ticket_number': ticket.ticket_number,
            'status': ticket.status,
            'response': ticket.response,
            'response_date': ticket.response_date.isoformat() if ticket.response_date else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# NEW ENDPOINT: Reopen ticket by ticket number
@contact_bp.route('/reopen-by-number/<string:ticket_number>', methods=['POST'])
def reopen_ticket_by_number(ticket_number):
    try:
        ticket = ContactMessage.query.filter_by(ticket_number=ticket_number).first_or_404()
        data = request.get_json()
        
        ticket.status = "reopened"
        ticket.updated_at = datetime.utcnow()
        
        if data.get("message"):
            ticket.response = (ticket.response or "") + f"\n[Reopened]: {data['message']}"
        
        db.session.commit()
        
        # Send reopening notification to user
        send_email_notification(
            ticket.email,
            f"Your Ticket #{ticket.ticket_number} Has Been Reopened",
            f"""
            <h2>Ticket Reopened</h2>
            <p>Dear {ticket.name},</p>
            <p>Your ticket #{ticket.ticket_number} with subject "{ticket.subject}" has been reopened.</p>
            <p><strong>Additional Information:</strong><br>{data.get('message', 'No additional information provided.')}</p>
            <p>Our team will review your request and get back to you soon.</p>
            <br>
            <p>Best regards,<br>SafeZone101 Kenya Team</p>
            """
        )
        
        return jsonify({
            "message": f"Ticket {ticket.ticket_number} has been reopened",
            "ticket_number": ticket.ticket_number,
            "id": ticket.id,
            "status": ticket.status
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/notify-delete/<int:ticket_id>', methods=['POST'])
def notify_delete(ticket_id):
    try:
        ticket = ContactMessage.query.get_or_404(ticket_id)
        data = request.get_json()
        reason = data.get('reason', 'admin_deletion')
        
        # Send email notification to user about deletion
        send_email_notification(
            ticket.email,
            f"Your Ticket #{ticket.ticket_number} Has Been Processed",
            f"""
            <h2>Ticket Processing Complete</h2>
            <p>Dear {ticket.name},</p>
            <p>Your ticket #{ticket.ticket_number} with subject "{ticket.subject}" has been processed and closed by our team.</p>
            <p>If you have any further questions or concerns, please don't hesitate to contact us again.</p>
            <br>
            <p>Best regards,<br>SafeZone101 Kenya Team</p>
            """
        )
        
        return jsonify({'message': 'User notified'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/notify-user/<int:ticket_id>', methods=['POST'])
def notify_user(ticket_id):
    try:
        ticket = ContactMessage.query.get_or_404(ticket_id)
        data = request.get_json()
        notification_type = data.get('notification_type', 'update')
        custom_message = data.get('message', '')
        
        # Update ticket status if marking as resolved
        if notification_type == 'resolution':
            ticket.status = 'resolved'
            ticket.response_date = datetime.utcnow()
            db.session.commit()
        
        # Send appropriate email notification
        if notification_type == 'resolution':
            send_email_notification(
                ticket.email,
                f"Your Ticket #{ticket.ticket_number} Has Been Resolved",
                f"""
                <h2>Ticket Resolution Notification</h2>
                <p>Dear {ticket.name},</p>
                <p>We're pleased to inform you that your ticket #{ticket.ticket_number} with subject "{ticket.subject}" has been resolved.</p>
                <p>{custom_message}</p>
                <p>If you have any further questions or concerns, please don't hesitate to contact us again.</p>
                <br>
                <p>Best regards,<br>SafeZone101 Kenya Team</p>
                """
            )
        else:
            send_email_notification(
                ticket.email,
                f"Update on Your Ticket #{ticket.ticket_number}",
                f"""
                <h2>Ticket Update Notification</h2>
                <p>Dear {ticket.name},</p>
                <p>There's an update on your ticket #{ticket.ticket_number} with subject "{ticket.subject}".</p>
                <p><strong>Update:</strong><br>{custom_message}</p>
                <p><strong>Current Status:</strong> {ticket.status.replace('_', ' ').title()}</p>
                <p>If you have any questions, please reply to this email or contact our support team.</p>
                <br>
                <p>Best regards,<br>SafeZone101 Kenya Team</p>
                """
            )
        
        return jsonify({'message': 'User notified'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/email/<int:ticket_id>', methods=['POST'])
def send_custom_email(ticket_id):
    try:
        ticket = ContactMessage.query.get_or_404(ticket_id)
        data = request.get_json()
        
        subject = data.get('subject', f"Update on Your Ticket #{ticket.ticket_number}")
        message_content = data.get('message', '')
        
        # Send custom email to user
        success = send_email_notification(
            ticket.email,
            subject,
            f"""
            <h2>{subject}</h2>
            <p>Dear {ticket.name},</p>
            <p>{message_content}</p>
            <br>
            <p>Best regards,<br>SafeZone101 Kenya Team</p>
            """
        )
        
        if success:
            return jsonify({'message': 'Email sent successfully'}), 200
        else:
            return jsonify({'error': 'Failed to send email'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500