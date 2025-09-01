import smtplib
import os
import uuid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import wraps
from flask import request, jsonify, session
from datetime import datetime, timedelta
from models import db, Notification, NotificationType, User

# ----------------- Email Configuration -----------------
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'Abdiaziznoor20@gmail.com')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD', 'tywlsprxunkzljml')
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')

# ----------------- Send Registration Email -----------------
def send_registration_email(user_email, user_name):
    """Send welcome email to new users."""
    receiver_email = user_email

    message = MIMEMultipart("alternative")
    message["Subject"] = "Welcome to SafeZone101!"
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email

    text = f"""
Hi {user_name},

You have successfully registered to SafeZone101.

Thank you for joining our emergency response community!

Regards,
SafeZone101 Team
"""
    part1 = MIMEText(text, "plain")
    message.attach(part1)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        print("✅ Registration email sent!")
        return True
    except Exception as e:
        print("❌ Failed to send email:", e)
        return False

# ----------------- Send OTP Email -----------------
def send_otp_email(user_email, user_name, otp):
    """Send OTP email for password reset."""
    receiver_email = user_email

    message = MIMEMultipart("alternative")
    message["Subject"] = "SafeZone101 Password Reset OTP"
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email

    text = f"""
Hi {user_name},

You requested to reset your password for SafeZone101.

Your OTP code is: {otp}

It is valid for 10 minutes. If you did not request this, please ignore this email.

Regards,
SafeZone101 Team
"""
    part1 = MIMEText(text, "plain")
    message.attach(part1)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        print("✅ OTP email sent!")
        return True
    except Exception as e:
        print("❌ Failed to send OTP email:", e)
        return False

# ----------------- Send Message Confirmation Email -----------------
def send_message_confirmation_email(user_email, title, message_content):
    """Send confirmation email when user submits a message."""
    receiver_email = user_email

    message = MIMEMultipart("alternative")
    message["Subject"] = "We've received your message - SafeZone101"
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email

    text = f"""
Hi there,

Thank you for contacting SafeZone101. We've received your message and our team will get back to you within 24-48 hours.

Your message details:
Subject: {title}
Message: {message_content}

If you have any urgent concerns, please call our support hotline.

Best regards,
SafeZone101 Customer Care Team
"""
    part1 = MIMEText(text, "plain")
    message.attach(part1)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        print("✅ Message confirmation email sent!")
        return True
    except Exception as e:
        print("❌ Failed to send message confirmation email:", e)
        return False

# ----------------- Send Admin Reply Email -----------------
def send_admin_reply_email(user_email, admin_name, original_title, reply_text):
    """Send email when admin replies to a user message."""
    receiver_email = user_email

    message = MIMEMultipart("alternative")
    message["Subject"] = f"Re: {original_title} - SafeZone101 Response"
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email

    text = f"""
Dear Valued User,

Thank you for contacting SafeZone101. Here is our response to your inquiry:

{reply_text}

If you have any further questions or need additional assistance, please don't hesitate to contact us.

Best regards,
{admin_name}
Customer Care Specialist
SafeZone101
Abdiaziznoor20@gmail.com
"""
    part1 = MIMEText(text, "plain")
    message.attach(part1)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        print("✅ Admin reply email sent!")
        return True
    except Exception as e:
        print("❌ Failed to send admin reply email:", e)
        return False

# ----------------- Session / Auth Decorators -----------------
def admin_required(f):
    """Decorator to protect routes for admin only."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "admin_user_id" not in session:
            return jsonify({"error": "Unauthorized: Admin login required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def login_required(f):
    """Decorator to protect routes for both users and admins."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not check_auth():  # ✅ now works for user_id OR admin_user_id
            return jsonify({"error": "Unauthorized: Login required"}), 401
        return f(*args, **kwargs)
    return decorated_function

# ----------------- Helper Functions -----------------
def check_auth():
    """Check if any user (admin or normal) is authenticated."""
    return 'user_id' in session or 'admin_user_id' in session

def get_current_user_id():
    """Return current logged-in user ID (user or admin)."""
    return session.get('user_id') or session.get('admin_user_id')

def is_admin():
    """Check if current user is admin."""
    return 'admin_user_id' in session

def get_current_user():
    """Return current user object if available."""
    user_id = get_current_user_id()
    if user_id:
        return User.query.get(user_id)
    return None

# ----------------- Notification Utilities -----------------
def create_notification(user_id, type, title, message, **kwargs):
    """Create a new notification"""
    notification = Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        is_urgent=kwargs.get('is_urgent', False),
        action_url=kwargs.get('action_url'),
        action_text=kwargs.get('action_text'),
        role=kwargs.get('role', 'user'),
        related_user_id=kwargs.get('related_user_id'),
        report_id=kwargs.get('report_id'),
        alert_id=kwargs.get('alert_id'),
        chat_id=kwargs.get('chat_id'),
        expires_at=kwargs.get('expires_at', datetime.utcnow() + timedelta(days=30))
    )
    
    db.session.add(notification)
    return notification

def notify_new_report(report):
    """Notify admins about a new report"""
    admins = User.query.filter_by(is_admin=True).all()
    for admin in admins:
        create_notification(
            user_id=admin.id,
            type=NotificationType.NEW_REPORT,
            title='New Emergency Report',
            message=f'New {report.report_type} report submitted by {report.author.first_name} {report.author.last_name}',
            is_urgent=report.urgency in ['high', 'urgent'],
            action_url=f'/admin/reports/{report.id}',
            action_text='View Report',
            role='admin',
            report_id=report.id
        )
    db.session.commit()

def notify_report_status_update(report, old_status):
    """Notify user about report status change"""
    create_notification(
        user_id=report.user_id,
        type=NotificationType.REPORT_STATUS_UPDATE,
        title='Report Status Updated',
        message=f'Your report "{report.title}" status changed from {old_status} to {report.status}',
        action_url=f'/reports/{report.id}',
        action_text='View Report',
        report_id=report.id
    )
    db.session.commit()

def notify_new_alert(alert):
    """Notify users about new admin alert"""
    users = User.query.filter_by(is_admin=False).all()
    for user in users:
        create_notification(
            user_id=user.id,
            type=NotificationType.ADMIN_ALERT,
            title=f'Alert: {alert.title}',
            message=alert.message,
            is_urgent=alert.severity in ['High', 'Critical'],
            action_url='/alerts',
            action_text='View Alerts',
            alert_id=alert.id
        )
    db.session.commit()

def notify_report_assigned(report, admin_user):
    """Notify admin when report is assigned to them"""
    create_notification(
        user_id=admin_user.id,
        type=NotificationType.REPORT_ASSIGNED,
        title='Report Assigned to You',
        message=f'Report "{report.title}" has been assigned to you for review',
        is_urgent=True,
        action_url=f'/admin/reports/{report.id}',
        action_text='Review Report',
        role='admin',
        report_id=report.id
    )
    db.session.commit()

def notify_new_message(message):
    """Notify admins about new customer message"""
    admins = User.query.filter_by(is_admin=True).all()
    for admin in admins:
        create_notification(
            user_id=admin.id,
            type=NotificationType.NEW_MESSAGE,
            title='New Customer Message',
            message=f'New message from {message.email}: {message.title}',
            is_urgent=message.priority in ['high', 'urgent'],
            action_url=f'/admin/messages/{message.id}',
            action_text='View Message',
            role='admin'
        )
    db.session.commit()

def notify_new_user(user):
    """Notify admins about new user registration"""
    admins = User.query.filter_by(is_admin=True).all()
    for admin in admins:
        create_notification(
            user_id=admin.id,
            type=NotificationType.NEW_USER,
            title='New User Registration',
            message=f'New user registered: {user.first_name} {user.last_name} ({user.email})',
            action_url=f'/admin/users/{user.id}',
            action_text='View User',
            role='admin',
            related_user_id=user.id
        )
    db.session.commit()

def notify_emergency_alert(alert, users):
    """Notify specific users about emergency alerts"""
    for user in users:
        create_notification(
            user_id=user.id,
            type=NotificationType.EMERGENCY,
            title=f'EMERGENCY: {alert.title}',
            message=alert.message,
            is_urgent=True,
            action_url='/emergency',
            action_text='Take Action',
            alert_id=alert.id
        )
    db.session.commit()

def notify_chat_message(chat, message, recipient_id):
    """Notify user about new chat message"""
    create_notification(
        user_id=recipient_id,
        type=NotificationType.CHAT_MESSAGE,
        title='New Chat Message',
        message=f'New message in {chat.title}: {message.content[:50]}...',
        action_url=f'/chats/{chat.id}',
        action_text='Open Chat',
        chat_id=chat.id
    )
    db.session.commit()

def get_user_notifications(user_id, unread_only=False, limit=20):
    """Get notifications for a user"""
    query = Notification.query.filter_by(user_id=user_id)
    if unread_only:
        query = query.filter_by(is_read=False)
    return query.order_by(Notification.created_at.desc()).limit(limit).all()

def get_unread_count(user_id):
    """Get count of unread notifications for a user"""
    return Notification.query.filter_by(user_id=user_id, is_read=False).count()

def mark_notification_as_read(notification_id, user_id):
    """Mark a notification as read"""
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if notification:
        notification.is_read = True
        db.session.commit()
        return True
    return False

def mark_all_notifications_read(user_id):
    """Mark all notifications as read for a user"""
    Notification.query.filter_by(user_id=user_id, is_read=False).update(
        {'is_read': True}, synchronize_session=False
    )
    db.session.commit()

def delete_notification(notification_id, user_id):
    """Delete a notification"""
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if notification:
        db.session.delete(notification)
        db.session.commit()
        return True
    return False