from flask_mail import Message
from extensions import mail
import smtplib
import os
import uuid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from functools import wraps
from flask import request, jsonify, session
from datetime import datetime, timedelta
from models import db, Notification, NotificationType, User

# ----------------- Email Configuration -----------------
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'Safezonee101@gmail.com')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD', 'qqsj gdmf evxk dkoz')
SECRET_KEY = os.getenv('SECRET_KEY', 'my-safety-web')

# ----------------- Contact Ticket Functions -----------------
def generate_ticket_number():
    """Generate a unique ticket number for contact requests"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"TKT-{timestamp}-{unique_id}"

def send_contact_confirmation(email, name, ticket_number, subject, message_content):
    """Send confirmation email to user when they submit a contact form"""
    receiver_email = email

    msg = MIMEMultipart("alternative")
    msg["Subject"] = Header(f"Thank you for contacting SafeZone101 - Ticket #{ticket_number}", 'utf-8')
    msg["From"] = SENDER_EMAIL
    msg["To"] = receiver_email
    msg["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
Hi {name},

Thank you for contacting SafeZone101. We have received your message and will get back to you soon.

Ticket Number: {ticket_number}
Subject: {subject}

Your Message:
{message_content}

You can reference this ticket number for any follow-up questions. If you need to reopen this ticket or add more information, please reply to this email or use the ticket number when contacting us.

Best regards,
SafeZone101 Team
"""

    # HTML version
    html_content = f"""
    <div class="success">
        <h2>Thank you for contacting SafeZone101, {name}!</h2>
        <p>We have received your message and will get back to you soon.</p>
    </div>
    
    <div class="details">
        <h3>Ticket Details:</h3>
        <p><strong>Ticket Number:</strong> {ticket_number}</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Your Message:</strong> {message_content}</p>
    </div>
    
    <div class="info">
        <p>You can reference this ticket number for any follow-up questions. If you need to reopen this ticket or add more information, please reply to this email or use the ticket number when contacting us.</p>
    </div>
    """

    html = get_email_template("Contact Confirmation", html_content)

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    msg.attach(part1)
    msg.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string().encode('utf-8'))
        print(f"✅ Contact confirmation email sent to {email} with ticket #{ticket_number}!")
        return True
    except Exception as e:
        print(f"❌ Failed to send contact confirmation email: {e}")
        return False

def send_admin_contact_notification(name, email, ticket_number, subject, message_content, phone=None):
    """Send notification to admin about new contact form submission"""
    admin_email = "Safezonee101@gmail.com"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = Header(f"New Contact Form Submission - Ticket #{ticket_number}", 'utf-8')
    msg["From"] = SENDER_EMAIL
    msg["To"] = admin_email
    msg["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
New Contact Form Submission

Ticket Number: {ticket_number}
From: {name} ({email})
Phone: {phone or 'Not provided'}
Subject: {subject}

Message:
{message_content}

Submitted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Please respond within 24 hours.

Best regards,
SafeZone101 System
"""

    # HTML version
    html_content = f"""
    <div class="info">
        <h2>New Contact Form Submission</h2>
        <p>A new contact form has been submitted and requires your attention.</p>
    </div>
    
    <div class="details">
        <h3>Contact Details:</h3>
        <p><strong>Ticket Number:</strong> {ticket_number}</p>
        <p><strong>From:</strong> {name} ({email})</p>
        <p><strong>Phone:</strong> {phone or 'Not provided'}</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Submitted at:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="details">
        <h3>Message:</h3>
        <p>{message_content}</p>
    </div>
    
    <div class="alert">
        <p><strong>Action Required:</strong> Please respond within 24 hours.</p>
    </div>
    """

    html = get_email_template("New Contact Submission", html_content, "View in Admin Panel", "https://safezone101.com/admin/contacts")

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    msg.attach(part1)
    msg.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, admin_email, msg.as_string().encode('utf-8'))
        print(f"✅ Admin notification sent for ticket #{ticket_number}!")
        return True
    except Exception as e:
        print(f"❌ Failed to send admin notification: {e}")
        return False

def send_ticket_reopened_notification(email, name, ticket_number, admin_name, additional_notes=None):
    """Send notification when a ticket is reopened"""
    receiver_email = email

    msg = MIMEMultipart("alternative")
    msg["Subject"] = Header(f"Your Ticket #{ticket_number} Has Been Reopened - SafeZone101", 'utf-8')
    msg["From"] = SENDER_EMAIL
    msg["To"] = receiver_email
    msg["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
Hi {name},

Your support ticket #{ticket_number} has been reopened by our support team.

Reopened by: {admin_name}
Reopened at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

{additional_notes if additional_notes else 'Our team will continue working on your inquiry and will update you shortly.'}

You can reply to this email to add more information to your ticket.

Best regards,
SafeZone101 Support Team
"""

    # HTML version
    html_content = f"""
    <div class="info">
        <h2>Ticket Reopened</h2>
        <p>Your support ticket <strong>#{ticket_number}</strong> has been reopened by our support team.</p>
    </div>
    
    <div class="details">
        <h3>Reopening Details:</h3>
        <p><strong>Reopened by:</strong> {admin_name}</p>
        <p><strong>Reopened at:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="details">
        <h3>Notes:</h3>
        <p>{additional_notes if additional_notes else 'Our team will continue working on your inquiry and will update you shortly.'}</p>
    </div>
    
    <div class="info">
        <p>You can reply to this email to add more information to your ticket.</p>
    </div>
    """

    html = get_email_template("Ticket Reopened", html_content, "View Ticket Status", f"https://safezone101.com/support/ticket/{ticket_number}")

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    msg.attach(part1)
    msg.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string().encode('utf-8'))
        print(f"✅ Ticket reopened notification sent for ticket #{ticket_number}!")
        return True
    except Exception as e:
        print(f"❌ Failed to send ticket reopened notification: {e}")
        return False

def send_ticket_update_notification(email, name, ticket_number, update_message, status, admin_name=None):
    """Send notification when ticket status is updated"""
    receiver_email = email

    msg = MIMEMultipart("alternative")
    msg["Subject"] = Header(f"Update on Your Ticket #{ticket_number} - SafeZone101", 'utf-8')
    msg["From"] = SENDER_EMAIL
    msg["To"] = receiver_email
    msg["Content-Type"] = "text/html; charset=UTF-8"

    status_colors = {
        'open': '#2196F3',
        'in_progress': '#FF9800',
        'resolved': '#4CAF50',
        'closed': '#9E9E9E',
        'reopened': '#E91E63'
    }

    # Plain text version
    text = f"""
Hi {name},

There's an update on your support ticket #{ticket_number}.

New Status: {status.upper()}
Updated by: {admin_name or 'Support Team'}
Update Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Update Message:
{update_message}

You can reply to this email to respond to this update or provide additional information.

Best regards,
SafeZone101 Support Team
"""

    # HTML version
    html_content = f"""
    <div class="info">
        <h2>Ticket Update</h2>
        <p>There's an update on your support ticket <strong>#{ticket_number}</strong>.</p>
    </div>
    
    <div class="details">
        <h3>Update Details:</h3>
        <p><strong>New Status:</strong> <span style="color: {status_colors.get(status, '#333')}; font-weight: bold;">{status.upper().replace('_', ' ')}</span></p>
        <p><strong>Updated by:</strong> {admin_name or 'Support Team'}</p>
        <p><strong>Update Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="details">
        <h3>Update Message:</h3>
        <p>{update_message}</p>
    </div>
    
    <div class="info">
        <p>You can reply to this email to respond to this update or provide additional information.</p>
    </div>
    """

    html = get_email_template("Ticket Update", html_content, "View Ticket", f"https://safezone101.com/support/ticket/{ticket_number}")

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    msg.attach(part1)
    msg.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string().encode('utf-8'))
        print(f"✅ Ticket update notification sent for ticket #{ticket_number}!")
        return True
    except Exception as e:
        print(f"❌ Failed to send ticket update notification: {e}")
        return False

# ----------------- Email Template Base -----------------
def get_email_template(title, content, button_text=None, button_url=None):
    """Base HTML email template with SafeZone101 styling"""
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }}
        .header {{
            background: linear-gradient(135deg, #1a73e8, #4285f4);
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .header h1 {{
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px;
        }}
        .footer {{
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 5px 5px;
        }}
        .button {{
            display: inline-block;
            padding: 12px 24px;
            background-color: #1a73e8;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .alert {{
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }}
        .success {{
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
        }}
        .info {{
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
        }}
        .details {{
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .congratulations {{
            color: #1a73e8;
            font-size: 22px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SafeZone101</h1>
        </div>
        <div class="content">
            {content}
            {f'<center><a href="{button_url}" class="button">{button_text}</a></center>' if button_text and button_url else ''}
        </div>
        <div class="footer">
            <p>© {datetime.now().year} SafeZone101. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
"""

# ----------------- Send Registration Email -----------------
def send_registration_email(user_email, user_name):
    """Send welcome email to new users."""
    receiver_email = user_email

    message = MIMEMultipart("alternative")
    message["Subject"] = Header("Welcome to SafeZone101!", 'utf-8')
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
Hi {user_name},

You have successfully registered to SafeZone101.

Thank you for joining our emergency response community!

Regards,
SafeZone101 Team
"""

    # HTML version
    html_content = f"""
    <div class="congratulations">Congratulations!</div>
    <p>Dear {user_name},</p>
    <div class="success">
        <p>You have successfully registered to SafeZone101.</p>
    </div>
    <p>Thank you for joining our emergency response community! We're dedicated to keeping you safe and informed.</p>
    <p>You can now access all features of our platform, including emergency reporting, alerts, and community resources.</p>
    """

    html = get_email_template("Welcome to SafeZone101!", html_content, "Access Your Dashboard", "https://safezone101.com/dashboard")

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string().encode('utf-8'))
        print("✅ Registration email sent!")
        return True
    except Exception as e:
        print("❌ Failed to send email:", e)
        return False

# ----------------- Send New User Registration Notification to Admin -----------------
def send_new_user_registration_email_to_admin(user):
    """Send email notification to admin when a new user registers."""
    admin_email = "Safezonee101@gmail.com"
    
    message = MIMEMultipart("alternative")
    message["Subject"] = Header(f"New User Registered - SafeZone101", 'utf-8')
    message["From"] = SENDER_EMAIL
    message["To"] = admin_email
    message["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
Hello Admin,

A new user has registered on SafeZone101.

User Details:
- Name: {user.first_name} {user.last_name}
- Email: {user.email}
- Phone: {user.phone or 'Not provided'}
- Registration Date: {user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else 'N/A'}
- User ID: {user.id}

You can view this user's profile in the admin dashboard.

Total registered users: {User.query.filter_by(is_admin=False).count()}

Best regards,
SafeZone101 System
"""

    # HTML version
    html_content = f"""
    <div class="info">
        <h2>New User Registration</h2>
        <p>A new user has registered on SafeZone101.</p>
    </div>
    
    <div class="details">
        <h3>User Details:</h3>
        <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone or 'Not provided'}</p>
        <p><strong>Registration Date:</strong> {user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else 'N/A'}</p>
        <p><strong>User ID:</strong> {user.id}</p>
    </div>
    
    <p>Total registered users: <strong>{User.query.filter_by(is_admin=False).count()}</strong></p>
    <p>You can view this user's profile in the admin dashboard.</p>
    """

    html = get_email_template("New User Registration", html_content, "View User Profile", "https://safezone101.com/admin/users")

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, admin_email, message.as_string().encode('utf-8'))
        print("✅ New user registration email sent to admin!")
        return True
    except Exception as e:
        print("❌ Failed to send new user registration email to admin:", e)
        return False


        # ----------------- Send Verification Email -----------------
def send_verification_email(user_email, user_name, otp):
    """Send verification email for new user signup."""
    receiver_email = user_email

    message = MIMEMultipart("alternative")
    message["Subject"] = Header("Verify Your SafeZone101 Account", 'utf-8')
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
Hi {user_name},

Welcome to SafeZone101! Please verify your email address to complete your registration.

Your verification code is: {otp}

This code is valid for 10 minutes. If you did not create an account, please ignore this email.

Regards,
SafeZone101 Team
"""

    # HTML version
    html_content = f"""
    <div class="congratulations">Welcome to SafeZone101!</div>
    <p>Hi {user_name},</p>
    
    <div class="info">
        <p>Please verify your email address to complete your registration and access all features.</p>
    </div>
    
    <div class="details">
        <h3>Your Verification Code:</h3>
        <div style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #1a73e8;">
            {otp}
        </div>
        <p style="text-align: center;">This code is valid for 10 minutes.</p>
    </div>
    
    <p>If you did not create an account with us, please ignore this email or contact our support team.</p>
    """

    html = get_email_template("Verify Your Account", html_content)

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string().encode('utf-8'))
        print("✅ Verification email sent!")
        return True
    except Exception as e:
        print("❌ Failed to send verification email:", e)
        return False

# ----------------- Send OTP Email -----------------
def send_otp_email(user_email, user_name, otp):
    """Send OTP email for password reset."""
    receiver_email = user_email

    message = MIMEMultipart("alternative")
    message["Subject"] = Header("SafeZone101 Password Reset OTP", 'utf-8')
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
Hi {user_name},

You requested to reset your password for SafeZone101.

Your OTP code is: {otp}

It is valid for 10 minutes. If you did not request this, please ignore this email.

Regards,
SafeZone101 Team
"""

    # HTML version
    html_content = f"""
    <p>Hi {user_name},</p>
    
    <div class="alert">
        <p>You requested to reset your password for SafeZone101.</p>
    </div>
    
    <div class="details">
        <h3>Your One-Time Password (OTP):</h3>
        <div style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #1a73e8;">
            {otp}
        </div>
        <p style="text-align: center;">This OTP is valid for 10 minutes.</p>
    </div>
    
    <p>If you did not request this password reset, please ignore this email or contact our support team immediately.</p>
    """

    html = get_email_template("Password Reset OTP", html_content)

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string().encode('utf-8'))
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
    message["Subject"] = Header("We've received your message - SafeZone101", 'utf-8')
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
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

    # HTML version
    html_content = f"""
    <div class="success">
        <h2>Message Received</h2>
        <p>Thank you for contacting SafeZone101. We've received your message and our team will get back to you within 24-48 hours.</p>
    </div>
    
    <div class="details">
        <h3>Your Message Details:</h3>
        <p><strong>Subject:</strong> {title}</p>
        <p><strong>Message:</strong> {message_content}</p>
    </div>
    
    <div class="alert">
        <p>If you have any urgent concerns, please call our support hotline at <strong>+1-800-SAFE-ZONE</strong>.</p>
    </div>
    """

    html = get_email_template("Message Received", html_content)

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string().encode('utf-8'))
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
    message["Subject"] = Header(f"Re: {original_title} - SafeZone101 Response", 'utf-8')
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
Dear Valued User,

Thank you for contacting SafeZone101. Here is our response to your inquiry:

{reply_text}

If you have any further questions or need additional assistance, please don't hesitate to contact us.

Best regards,
{admin_name}
Customer Care Specialist
SafeZone101
"""

    # HTML version
    html_content = f"""
    <div class="info">
        <h2>Response to Your Inquiry</h2>
        <p>Thank you for contacting SafeZone101. Here is our response to your inquiry regarding <strong>"{original_title}"</strong>.</p>
    </div>
    
    <div class="details">
        <h3>Our Response:</h3>
        <p>{reply_text}</p>
    </div>
    
    <p>If you have any further questions or need additional assistance, please don't hesitate to contact us.</p>
    
    <div class="footer" style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
        <p>Best regards,</p>
        <p><strong>{admin_name}</strong><br>
        Customer Care Specialist<br>
        SafeZone101</p>
    </div>
    """

    html = get_email_template("Response to Your Message", html_content, "Contact Support", "Safezonee101@gmail.com")

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string().encode('utf-8'))
        print("✅ Admin reply email sent!")
        return True
    except Exception as e:
        print("❌ Failed to send admin reply email:", e)
        return False

# ----------------- Send Report Confirmation Email -----------------
def send_report_confirmation_email(user_email, user_name, report_title, report_type):
    """Send confirmation email to user when they submit a report."""
    receiver_email = user_email

    message = MIMEMultipart("alternative")
    message["Subject"] = Header("Your Report Has Been Submitted - SafeZone101", 'utf-8')
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
Hi {user_name},

Thank you for submitting your {report_type} report to SafeZone101.

Report Title: {report_title}

We have received your report and our team will review it shortly. You can check the status of your report in your dashboard.

If this is an emergency, please contact local authorities immediately.

Best regards,
SafeZone101 Team
"""

    # HTML version
    html_content = f"""
    <div class="success">
        <h2>Report Submitted Successfully</h2>
        <p>Thank you for submitting your {report_type} report to SafeZone101.</p>
    </div>
    
    <div class="details">
        <h3>Report Details:</h3>
        <p><strong>Report Title:</strong> {report_title}</p>
        <p><strong>Report Type:</strong> {report_type}</p>
        <p><strong>Submission Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <p>We have received your report and our team will review it shortly. You can check the status of your report in your dashboard.</p>
    
    <div class="alert">
        <p><strong>Important:</strong> If this is an emergency, please contact local authorities immediately by calling <strong>911</strong> or your local emergency number.</p>
    </div>
    """

    html = get_email_template("Report Submission Confirmation", html_content, "View Report Status", "https://safezone101.com/dashboard/reports")

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, message.as_string().encode('utf-8'))
        print("✅ Report confirmation email sent to user!")
        return True
    except Exception as e:
        print("❌ Failed to send report confirmation email:", e)
        return False

# ----------------- Send Admin Report Notification Email -----------------
def send_admin_report_notification(report, user):
    """Send notification email to specific admin about a new report."""
    admin_email = "Safezonee101@gmail.com"

    message = MIMEMultipart("alternative")
    message["Subject"] = Header(f"New {report.report_type} Report Submitted - SafeZone101", 'utf-8')
    message["From"] = SENDER_EMAIL
    message["To"] = admin_email
    message["Content-Type"] = "text/html; charset=UTF-8"

    # Plain text version
    text = f"""
Hello Admin,

A new {report.report_type} report has been submitted to SafeZone101.

Report Details:
- Title: {report.title}
- Submitted by: {user.first_name} {user.last_name} ({user.email})
- Urgency: {report.urgency}
- Location: {report.location}
- Date: {report.date}
- Description: {report.description}

Please log in to your admin dashboard to review this report.

Best regards,
SafeZone101 System
"""

    # HTML version
    html_content = f"""
    <div class="info">
        <h2>New {report.report_type} Report Submitted</h2>
        <p>A new {report.report_type} report has been submitted to SafeZone101.</p>
    </div>
    
    <div class="details">
        <h3>Report Details:</h3>
        <p><strong>Title:</strong> {report.title}</p>
        <p><strong>Submitted by:</strong> {user.first_name} {user.last_name} ({user.email})</p>
        <p><strong>Urgency:</strong> <span style="color: {'#d32f2f' if report.urgency in ['high', 'urgent'] else '#ff9800' if report.urgency == 'medium' else '#4caf50'}">{report.urgency.upper()}</span></p>
        <p><strong>Location:</strong> {report.location}</p>
        <p><strong>Date:</strong> {report.date}</p>
        <p><strong>Description:</strong> {report.description}</p>
    </div>
    
    <p>Please log in to your admin dashboard to review this report.</p>
    """

    html = get_email_template(f"New {report.report_type} Report", html_content, "Review Report", "https://safezone101.com/admin/reports")

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, admin_email, message.as_string().encode('utf-8'))
        print("✅ Report notification email sent to admin!")
        return True
    except Exception as e:
        print("❌ Failed to send report notification email to admin:", e)
        return False
# ----------------- Send Alert Notification Email -----------------
def send_alert_notification_email(alert):
    """Send alert notification email to all registered users."""
    # Get all non-admin users with valid emails
    users = User.query.filter_by(is_admin=False).filter(User.email.isnot(None)).all()
    
    successful_sends = 0
    failed_sends = 0
    failed_emails = []
    
    for user in users:
        receiver_email = user.email
        
        message = MIMEMultipart("alternative")
        message["Subject"] = Header(f"EMERGENCY ALERT: {alert.title} - SafeZone101", 'utf-8')
        message["From"] = SENDER_EMAIL
        message["To"] = receiver_email
        message["Content-Type"] = "text/html; charset=UTF-8"

        # Plain text version (remove emoji for plain text)
        text = f"""
URGENT ALERT - SafeZone101

Dear {user.first_name} {user.last_name},

This is an important emergency alert from SafeZone101:

ALERT TITLE: {alert.title}
SEVERITY LEVEL: {alert.severity}
ISSUED AT: {alert.created_at.strftime('%Y-%m-%d %H:%M:%S')}

MESSAGE:
{alert.message}

LOCATION AFFECTED: {alert.affected_area or 'Multiple areas'}

INSTRUCTIONS:
Please follow the safety instructions provided above. Stay safe and follow local authorities' guidance.

This alert has been sent to all SafeZone101 registered users in the affected area.

If this is a mistake or you wish to adjust your alert preferences, please log in to your account.

Stay safe,
SafeZone101 Emergency Response Team
"""

        # HTML version (keep emoji in HTML)
        severity_color = "#d32f2f" if alert.severity in ['Critical', 'High'] else "#ff9800" if alert.severity == 'Medium' else "#4caf50"
        
        html_content = f"""
        <div style="background-color: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0;">
            <h2 style="color: #d32f2f; margin: 0;">EMERGENCY ALERT</h2>
        </div>
        
        <p>Dear {user.first_name} {user.last_name},</p>
        
        <p>This is an important emergency alert from <strong>SafeZone101</strong>:</p>
        
        <div class="details">
            <h3>Alert Details:</h3>
            <p><strong>Alert Title:</strong> {alert.title}</p>
            <p><strong>Severity Level:</strong> <span style="color: {severity_color}; font-weight: bold;">{alert.severity}</span></p>
            <p><strong>Issued At:</strong> {alert.created_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>Location Affected:</strong> {alert.affected_area or 'Multiple areas'}</p>
        </div>
        
        <div class="alert">
            <h3>Message:</h3>
            <p>{alert.message}</p>
        </div>
        
        <div class="info">
            <h3>Instructions:</h3>
            <p>Please follow the safety instructions provided above. Stay safe and follow local authorities' guidance.</p>
        </div>
        
        <p>This alert has been sent to all SafeZone101 registered users in the affected area.</p>
        
        <div class="footer" style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
            <p>Stay safe,<br>
            <strong>SafeZone101 Emergency Response Team</strong></p>
        </div>
        """

        html = get_email_template(f"EMERGENCY ALERT: {alert.title}", html_content, "View More Details", "https://safezone101.com/alerts")

        part1 = MIMEText(text, "plain", "utf-8")
        part2 = MIMEText(html, "html", "utf-8")
        
        message.attach(part1)
        message.attach(part2)

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                server.sendmail(SENDER_EMAIL, receiver_email, message.as_string().encode('utf-8'))
            print(f"✅ Alert email sent to {user.email}!")
            successful_sends += 1
        except Exception as e:
            print(f"❌ Failed to send alert email to {user.email}: {e}")
            failed_sends += 1
            failed_emails.append({
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}",
                'error': str(e)
            })
    
    # Notify admins about failed email deliveries
    if failed_emails:
        notify_admin_failed_emails(alert, failed_emails, successful_sends, failed_sends)
    
    return {
        "successful": successful_sends,
        "failed": failed_sends,
        "total": len(users),
        "failed_emails": failed_emails
    }

# ----------------- Send Admin Failed Email Notification -----------------
def send_admin_failed_email_notification(alert, failed_emails, successful_sends, failed_sends):
    """Send email to admin about failed alert email deliveries."""
    admin_email = "Safezonee101@gmail.com"

    message = MIMEMultipart("alternative")
    message["Subject"] = Header(f"Alert Email Delivery Issues - {alert.title}", 'utf-8')
    message["From"] = SENDER_EMAIL
    message["To"] = admin_email
    message["Content-Type"] = "text/html; charset=UTF-8"

    # Create list of failed emails for the report
    failed_list = "\n".join([f"- {email['name']} ({email['email']}): {email['error']}" for email in failed_emails[:10]])  # Show first 10 failures
    
    if len(failed_emails) > 10:
        failed_list += f"\n- ... and {len(failed_emails) - 10} more failures"

    # Plain text version (replace copyright symbol with (c))
    text = f"""
ALERT EMAIL DELIVERY REPORT

Alert: {alert.title}
Severity: {alert.severity}
Sent: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

DELIVERY STATISTICS:
- Total recipients: {successful_sends + failed_sends}
- Successful deliveries: {successful_sends}
- Failed deliveries: {failed_sends}

FAILED DELIVERIES:
{failed_list}

ACTION REQUIRED:
Please review the failed email addresses and consider:
1. Checking if these users need to update their email addresses
2. Verifying email server configuration
3. Following up with users who didn't receive critical alerts

Best regards,
SafeZone101 System
"""

    # HTML version (keep copyright symbol in HTML)
    html_content = f"""
    <div class="alert">
        <h2>Alert Email Delivery Issues</h2>
        <p>There were issues delivering emergency alert emails to some users.</p>
    </div>
    
    <div class="details">
        <h3>Alert Details:</h3>
        <p><strong>Alert:</strong> {alert.title}</p>
        <p><strong>Severity:</strong> {alert.severity}</p>
        <p><strong>Sent:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
    </div>
    
    <div class="details">
        <h3>Delivery Statistics:</h3>
        <p><strong>Total recipients:</strong> {successful_sends + failed_sends}</p>
        <p><strong>Successful deliveries:</strong> <span style="color: #4caf50">{successful_sends}</span></p>
        <p><strong>Failed deliveries:</strong> <span style="color: #d32f2f">{failed_sends}</span></p>
    </div>
    
    <div class="details">
        <h3>Failed Deliveries (first 10):</h3>
        <ul>
    """
    
    for email in failed_emails[:10]:
        html_content += f"<li><strong>{email['name']}</strong> ({email['email']}): {email['error']}</li>"
    
    if len(failed_emails) > 10:
        html_content += f"<li>... and {len(failed_emails) - 10} more failures</li>"
    
    html_content += """
        </ul>
    </div>
    
    <div class="info">
        <h3>Action Required:</h3>
        <p>Please review the failed email addresses and consider:</p>
        <ol>
            <li>Checking if these users need to update their email addresses</li>
            <li>Verifying email server configuration</li>
            <li>Following up with users who didn't receive critical alerts</li>
        </ol>
    </div>
    """

    html = get_email_template("Alert Delivery Issues", html_content, "Review Alerts", "https://safezone101.com/admin/alerts")

    part1 = MIMEText(text, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")
    
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, admin_email, message.as_string().encode('utf-8'))
        print("✅ Admin notification sent for failed email deliveries!")
        return True
    except Exception as e:
        print(f"❌ Failed to send admin notification about failed emails: {e}")
        return False

# ----------------- Notify Admin About Failed Emails -----------------
def notify_admin_failed_emails(alert, failed_emails, successful_sends, failed_sends):
    """Create in-app notification for admins about failed email deliveries."""
    admins = User.query.filter_by(is_admin=True).all()
    
    for admin in admins:
        create_notification(
            user_id=admin.id,
            type=NotificationType.SYSTEM_ALERT,
            title='Alert Email Delivery Issues',
            message=f'{failed_sends} alert emails failed to deliver for "{alert.title}". {successful_sends} successful.',
            is_urgent=True,
            action_url='/admin/alerts',
            action_text='Review Alerts',
            role='admin',
            alert_id=alert.id
        )
    
    db.session.commit()
    
    # Also send email notification to admin
    send_admin_failed_email_notification(alert, failed_emails, successful_sends, failed_sends)

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
        if not check_auth():  # 
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
        action_url=f'/dashboard/myreports/{report.id}',
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
            action_url='/dashboard/alerts',
            action_text='View Alerts',
            alert_id=alert.id
        )
    db.session.commit()
    
    # Send email notifications to all users
    send_alert_notification_email(alert)



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