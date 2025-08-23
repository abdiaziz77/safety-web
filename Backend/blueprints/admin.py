from flask import Blueprint, request, jsonify, session
from models import db, AdminUser
from utils import admin_required   # import the decorator

admin_auth_bp = Blueprint('admin_auth', __name__)

@admin_auth_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = AdminUser.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid admin credentials"}), 401

    session['admin_user_id'] = user.id

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email
        }
    }), 200


@admin_auth_bp.route('/get_current_admin_user', methods=['GET'])
@admin_required
def get_current_admin_user():
    user = AdminUser.query.get(session['admin_user_id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name if hasattr(user, 'name') else None,
            "role": "admin"
        }
    }), 200
@admin_auth_bp.route('/logout', methods=['POST'])
@admin_required
def admin_logout():
    """Logout admin and clear session"""
    session.clear()
    response = jsonify({"message": "Logged out successfully"})
    response.set_cookie('admin_session', '', expires=0, max_age=0)
    response.set_cookie('user_role', '', expires=0, max_age=0)
    return response