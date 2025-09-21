from flask import Blueprint, request, jsonify, session
from extensions import db
from models import Feedback, AdminUser
from datetime import datetime, timedelta
import uuid

feedback_bp = Blueprint('feedback', __name__)



# Feedback submission
@feedback_bp.route('/', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        
        # Create new feedback
        feedback = Feedback(
            id=str(uuid.uuid4()),
            name=data['name'],
            email=data['email'],
            rating=data['rating'],
            message=data['message'],
            created_at=datetime.utcnow()
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'message': 'Thank you for your feedback! It will be reviewed by our team.',
            'feedback': feedback.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to submit feedback. Please try again.'}), 500

# Get approved feedback (public)
# Get approved feedback (public) - Updated to return top 3 by rating
@feedback_bp.route('/approved', methods=['GET'])
def get_approved_feedback():
    try:
        # Get only approved feedback, highest rated first, limit to 3
        feedbacks = Feedback.query.filter_by(approved=True)\
            .order_by(Feedback.rating.desc(), Feedback.created_at.desc())\
            .limit(3)\
            .all()
        
        return jsonify({
            'feedbacks': [f.to_dict() for f in feedbacks]
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve feedback.'}), 500
# Get all feedback (admin only)
@feedback_bp.route('/all', methods=['GET'])
def get_all_feedback():
    try:
        # Check if user is admin (you'll need to implement authentication)
        # if not session.get('is_admin'):
        #     return jsonify({'error': 'Unauthorized'}), 401
        
        feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
        
        return jsonify({
            'feedbacks': [f.to_dict() for f in feedbacks]
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve feedback.'}), 500

# Approve feedback
@feedback_bp.route('/<feedback_id>/approve', methods=['PATCH'])
def approve_feedback(feedback_id):
    try:
        # Check if user is admin
        # if not session.get('is_admin'):
        #     return jsonify({'error': 'Unauthorized'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
            
        feedback.approved = True
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback approved successfully',
            'feedback': feedback.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to approve feedback.'}), 500

# Reject feedback
@feedback_bp.route('/<feedback_id>/reject', methods=['PATCH'])
def reject_feedback(feedback_id):
    try:
        # Check if user is admin
        # if not session.get('is_admin'):
        #     return jsonify({'error': 'Unauthorized'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
            
        feedback.approved = False
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback rejected successfully',
            'feedback': feedback.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reject feedback.'}), 500

# Update feedback
@feedback_bp.route('/<feedback_id>', methods=['PUT'])
def update_feedback(feedback_id):
    try:
        # Check if user is admin
        # if not session.get('is_admin'):
        #     return jsonify({'error': 'Unauthorized'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
            
        data = request.get_json()
        
        feedback.name = data.get('name', feedback.name)
        feedback.email = data.get('email', feedback.email)
        feedback.rating = data.get('rating', feedback.rating)
        feedback.message = data.get('message', feedback.message)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback updated successfully',
            'feedback': feedback.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update feedback.'}), 500

# Delete feedback
@feedback_bp.route('/<feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    try:
        # Check if user is admin
        # if not session.get('is_admin'):
        #     return jsonify({'error': 'Unauthorized'}), 401
        
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
            
        db.session.delete(feedback)
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete feedback.'}), 500