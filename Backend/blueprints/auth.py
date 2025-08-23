from flask import Blueprint, request, jsonify, session
from models import db, User
from utils import send_registration_email, login_required, admin_required
from datetime import datetime
from werkzeug.security import generate_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    required_fields = ['firstName', 'lastName', 'email', 'phone', 'role', 'password']

    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already registered"}), 400

    try:
        user = User(
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            phone=data['phone'],
            role=data['role'],
            password_hash=generate_password_hash(data['password'])
        )

        db.session.add(user)
        db.session.commit()

        try:
            send_registration_email(user.email, user.first_name)
        except Exception as e:
            print("Failed to send registration email:", e)

        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "role": user.role
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data['email']).first()
    if user is None or not user.check_password(data['password']):
        return jsonify({"message": "Invalid email or password"}), 401

    # Set session data
    session['user_id'] = user.id
    session['user_role'] = user.role
    session.permanent = True  # Makes the session persistent

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

@auth_bp.route('/logout', methods=['POST'])
def user_logout():
    """Logout user and clear session"""
    session.clear()
    response = jsonify({"message": "Logged out successfully"})
    response.set_cookie('session', '', expires=0, max_age=0)
    response.set_cookie('user_role', '', expires=0, max_age=0)
    return response

@auth_bp.route('/access_user_dash', methods=['GET'])
@login_required
def access_user_dash():
    user_id = session.get('user_id')
    user = User.query.get(user_id)
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
    user_id = session.get('user_id')
    user = User.query.get(user_id)
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

@auth_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Simple version - get all users without complex fields"""
    try:
        users = User.query.all()
        users_data = []
        
        for user in users:
            user_data = {
                "id": user.id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "isActive": getattr(user, 'is_active', True),
            }
            
            # Only include created_at if it exists
            if hasattr(user, 'created_at') and user.created_at:
                user_data["createdAt"] = user.created_at.isoformat()
                
            users_data.append(user_data)
        
        return jsonify({"users": users_data}), 200
        
    except Exception as e:
        print(f"Error in get_all_users: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

# Add these routes to your auth_bp in Flask

@auth_bp.route('/users/<user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user information - Admin only"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        data = request.json
        
        # Update basic info
        if 'firstName' in data:
            user.first_name = data['firstName']
        if 'lastName' in data:
            user.last_name = data['lastName']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'role' in data:
            user.role = data['role']
        if 'isActive' in data:
            user.is_active = data['isActive']
        
        db.session.commit()
        
        return jsonify({
            "message": "User updated successfully",
            "user": {
                "id": user.id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "isActive": user.is_active
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating user: {str(e)}"}), 500

@auth_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete user - Admin only"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"message": "User deleted successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting user: {str(e)}"}), 500

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@login_required
def profile():
    user_id = session.get('user_id')
    user = User.query.get(user_id)
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
            # Update basic info
            user.first_name = data.get('firstName', user.first_name)
            user.last_name = data.get('lastName', user.last_name)
            user.phone = data.get('phone', user.phone)

            # Handle date of birth
            dob_str = data.get('dateOfBirth')
            if dob_str:
                user.date_of_birth = datetime.strptime(dob_str, '%Y-%m-%d').date()
            elif 'dateOfBirth' in data and data['dateOfBirth'] is None:
                user.date_of_birth = None

            # Update other fields
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

            # Update password if provided
            if 'password' in data and data['password']:
                user.set_password(data['password'])

            db.session.commit()
            return jsonify({"message": "Profile updated successfully"}), 200

        except ValueError as e:
            db.session.rollback()
            return jsonify({"message": f"Invalid data format: {str(e)}"}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Error updating profile: {str(e)}"}), 500