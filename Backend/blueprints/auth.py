import random
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from utils import (
    send_registration_email,
    send_verification_email,
    send_otp_email,
    login_required,
    admin_required,
    notify_new_user,
    send_new_user_registration_email_to_admin  # Add this import
)

auth_bp = Blueprint('auth', __name__)

# ------------------ SIGNUP ------------------
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    required_fields = ['firstName', 'lastName', 'email', 'phone', 'role', 'password']

    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already registered"}), 400

    try:
        # Generate OTP for verification
        signup_otp = str(random.randint(100000, 999999))
        
        user = User(
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            phone=data['phone'],
            role=data['role'],
            password_hash=generate_password_hash(data['password']),
            signup_otp=signup_otp,
            signup_otp_expiry=datetime.now() + timedelta(minutes=10),
            is_verified=False  # User is not verified yet
        )

        db.session.add(user)
        db.session.commit()

        # Send verification email to the new user
        try:
            send_verification_email(user.email, user.first_name, signup_otp)
        except Exception as e:
            print("Failed to send verification email:", e)
            db.session.rollback()
            return jsonify({"message": "Failed to send verification email"}), 500

        return jsonify({
            "message": "User registered successfully. Please check your email for verification code.",
            "email": user.email,
            "requires_verification": True
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# ------------------ VERIFY SIGNUP ------------------
@auth_bp.route('/verify-signup', methods=['POST'])
def verify_signup():
    data = request.json
    email, otp = data.get('email'), data.get('otp')
    
    if not email or not otp:
        return jsonify({"message": "Email and OTP are required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    if not user.signup_otp:
        return jsonify({"message": "User already verified or invalid request"}), 400
        
    if user.signup_otp != otp:
        return jsonify({"message": "Invalid verification code"}), 400
        
    if datetime.now() > user.signup_otp_expiry:
        return jsonify({"message": "Verification code expired"}), 400
        
    # Mark user as verified and clear OTP
    user.is_verified = True
    user.signup_otp = None
    user.signup_otp_expiry = None
    db.session.commit()
    
    # Send welcome email
    try:
        send_registration_email(user.email, user.first_name)
    except Exception as e:
        print("Failed to send welcome email:", e)
    
    # Notify admins about new user
    try:
        notify_new_user(user)
        send_new_user_registration_email_to_admin(user)
    except Exception as e:
        print("Failed to notify admins:", e)
    
    return jsonify({
        "message": "Email verified successfully. You can now login.",
        "verified": True
    }), 200

# ------------------ RESEND VERIFICATION ------------------
@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"message": "Email is required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    if user.is_verified:
        return jsonify({"message": "User already verified"}), 400
        
    # Generate new OTP
    new_otp = str(random.randint(100000, 999999))
    user.signup_otp = new_otp
    user.signup_otp_expiry = datetime.now() + timedelta(minutes=10)
    db.session.commit()
    
    # Resend verification email
    try:
        send_verification_email(user.email, user.first_name, new_otp)
        return jsonify({"message": "Verification code sent to your email"}), 200
    except Exception as e:
        print("Failed to resend verification email:", e)
        return jsonify({"message": "Failed to resend verification email"}), 500

# Update the login function to check verification status
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid email or password"}), 401
        
    # Check if user is verified
    if not user.is_verified:
        return jsonify({
            "message": "Email not verified. Please check your email for verification code.",
            "requires_verification": True,
            "email": user.email
        }), 401

    session['user_id'] = user.id
    session['user_role'] = user.role
    session.permanent = True

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "firstName": user.first_name,
            "lastName": user.last_name
        }
    }), 200

# ------------------ LOGOUT ------------------
@auth_bp.route('/logout', methods=['POST'])
def user_logout():
    session.clear()
    response = jsonify({"message": "Logged out successfully"})
    response.set_cookie('session', '', expires=0, max_age=0)
    response.set_cookie('user_role', '', expires=0, max_age=0)
    return response

# ------------------ USER DASHBOARD ------------------
@auth_bp.route('/access_user_dash', methods=['GET'])
@login_required
def access_user_dash():
    user = User.query.get(session.get('user_id'))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "message": "Welcome to your dashboard",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "firstName": user.first_name,
            "lastName": user.last_name
        }
    }), 200

@auth_bp.route('/get_current_user', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session.get('user_id'))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "firstName": user.first_name,
            "lastName": user.last_name
        }
    }), 200

# ------------------ PROFILE ------------------
@auth_bp.route('/profile', methods=['GET', 'PUT'])
@login_required
def profile():
    user = User.query.get(session.get('user_id'))
    if not user:
        return jsonify({"message": "User not found"}), 404

    if request.method == 'GET':
        return jsonify({
            "id": user.id,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "dateOfBirth": user.date_of_birth.isoformat() if user.date_of_birth else None,
            "gender": user.gender,
            "addressLine1": user.address_line_1,
            "addressLine2": user.address_line_2,
            "city": user.city,
            "state": user.state,
            "zipCode": user.zip_code,
            "country": user.country,
            "language": user.language,
            "timeZone": user.time_zone,
            "theme": user.theme,
        }), 200

    if request.method == 'PUT':
        data = request.json
        try:
            user.first_name = data.get('firstName', user.first_name)
            user.last_name = data.get('lastName', user.last_name)
            user.phone = data.get('phone', user.phone)
            dob_str = data.get('dateOfBirth')
            if dob_str:
                user.date_of_birth = datetime.strptime(dob_str, '%Y-%m-%d').date()
            user.gender = data.get('gender', user.gender)
            user.address_line_1 = data.get('addressLine1', user.address_line_1)
            user.address_line_2 = data.get('addressLine2', user.address_line_2)
            user.city = data.get('city', user.city)
            user.state = data.get('state', user.state)
            user.zip_code = data.get('zipCode', user.zip_code)
            user.country = data.get('country', user.country)
            user.language = data.get('language', user.language)
            user.time_zone = data.get('timeZone', user.time_zone)
            user.theme = data.get('theme', user.theme)

            if 'password' in data and data['password']:
                if 'currentPassword' not in data or not data['currentPassword']:
                    return jsonify({"message": "Current password is required to change password"}), 400
                if not check_password_hash(user.password_hash, data['currentPassword']):
                    return jsonify({"message": "Current password is incorrect"}), 400
                user.password_hash = generate_password_hash(data['password'])

            db.session.commit()
            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Error updating profile: {str(e)}"}), 500

# ------------------ CHANGE PASSWORD ------------------
@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    user = User.query.get(session.get('user_id'))
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.json
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not current_password or not new_password:
        return jsonify({"message": "Current password and new password are required"}), 400

    if not check_password_hash(user.password_hash, current_password):
        return jsonify({"message": "Current password is incorrect"}), 400

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200

# ------------------ ADMIN USER MANAGEMENT ------------------
@auth_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    users = User.query.all()
    return jsonify({
        "users": [
            {
                "id": user.id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "isActive": getattr(user, 'is_active', True),
                "createdAt": user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None
            } for user in users
        ]
    }), 200

@auth_bp.route('/users/<user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    data = request.json
    for key, attr in [
        ('firstName','first_name'), ('lastName','last_name'),
        ('email','email'), ('phone','phone'),
        ('role','role'), ('isActive','is_active')
    ]:
        if key in data:
            setattr(user, attr, data[key])
    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200

@auth_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200

# ------------------ FORGOT PASSWORD ------------------
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({"message": "Email is required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Email not registered"}), 404

    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_expiry = datetime.now() + timedelta(minutes=10)
    db.session.commit()

    try:
        send_otp_email(user.email, user.first_name, otp)
    except Exception as e:
        print("Failed to send OTP email:", e)
        return jsonify({"message": "Failed to send OTP email"}), 500

    return jsonify({"message": "OTP sent to your email"}), 200

# ------------------ VERIFY OTP ------------------
@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email, otp = data.get('email'), data.get('otp')
    if not email or not otp:
        return jsonify({"message": "Email and OTP are required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.otp:
        return jsonify({"message": "Invalid request"}), 400
    if user.otp != otp:
        return jsonify({"message": "Invalid OTP"}), 400
    if datetime.now() > user.otp_expiry:
        return jsonify({"message": "OTP expired"}), 400
    return jsonify({"message": "OTP verified"}), 200

# ------------------ RESET PASSWORD ------------------
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email, otp, new_password = data.get('email'), data.get('otp'), data.get('newPassword')
    if not email or not otp or not new_password:
        return jsonify({"message": "Email, OTP, and new password are required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.otp:
        return jsonify({"message": "Invalid request"}), 400
    if user.otp != otp:
        return jsonify({"message": "Invalid OTP"}), 400
    if datetime.now() > user.otp_expiry:
        return jsonify({"message": "OTP expired"}), 400

    user.password_hash = generate_password_hash(new_password)
    user.otp = None
    user.otp_expiry = None
    db.session.commit()
    return jsonify({"message": "Password reset successfully"}), 200