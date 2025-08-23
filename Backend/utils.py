import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import wraps
from flask import request, jsonify, session

# Email configuration (should be in environment variables)
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'your_email@gmail.com')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD', 'your_email_password')
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')

# --- Send Registration Email ---
def send_registration_email(user_email, user_name):
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
    except Exception as e:
        print("❌ Failed to send email:", e)

# --- Admin Required (Session-based) ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "admin_user_id" not in session:
            return jsonify({"error": "Unauthorized: Admin login required"}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- Login Required (for normal users, session-based) ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Unauthorized: Login required"}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- Check if user is authenticated (for views that show different content to auth vs non-auth users) ---
def check_auth():
    return 'user_id' in session or 'admin_user_id' in session

# --- Get current user ID ---
def get_current_user_id():
    return session.get('user_id') or session.get('admin_user_id')

# --- Check if current user is admin ---
def is_admin():
    return 'admin_user_id' in session