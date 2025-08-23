from flask import Blueprint, request, jsonify
from flask_mail import Message
from extensions import mail
from models import db, SentEmail

email_bp = Blueprint("email", __name__)

@email_bp.route("/send", methods=["POST"])
def send_email():
    data = request.get_json()

    recipient = data.get("recipient") or data.get("to")
    subject = data.get("subject")
    message = data.get("message") or data.get("text")

    if not recipient or not subject or not message:
        return jsonify({"error": "All fields are required"}), 400

    try:
        msg = Message(subject, recipients=[recipient])
        msg.body = message
        mail.send(msg)

        email_record = SentEmail(
            recipient=recipient,
            subject=subject,
            message=message
        )
        db.session.add(email_record)
        db.session.commit()

        return jsonify({"message": "Email sent successfully"}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()  # log full error to terminal
        return jsonify({"error": f"Email send failed: {str(e)}"}), 500
