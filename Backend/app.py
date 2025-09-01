from flask import Flask
from flask_cors import CORS
from flask_session import Session
from flask_migrate import Migrate
from flask_mail import Mail
import os

from models import db, AdminUser  
from blueprints.auth import auth_bp
from blueprints.reports import reports_bp
from blueprints.email import email_bp
from blueprints.alerts import alerts_bp
from blueprints.admin import admin_auth_bp 
from blueprints.chat import chat_bp 
from blueprints.notification import notifications_bp
from blueprints.messages import messages_bp

# Initialize Flask-Mail
mail = Mail()

def create_default_admin_user():
    """Create default admin if it does not exist."""
    user = AdminUser.query.filter_by(email='admin@safezone101.com').first()
    if user:
        print("Admin user already exists.")
        return

    user = AdminUser(email='admin@safezone101.com')
    user.set_password('12345678')  
    db.session.add(user)
    db.session.commit()
    print("Default admin user created.")

def create_app():
    app = Flask(__name__)

    # ---------------- CONFIG ----------------
    class Config:
        SECRET_KEY = os.getenv('SECRET_KEY', 'supersecretkey')
        SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
        SQLALCHEMY_TRACK_MODIFICATIONS = False

        # Flask-Session
        SESSION_TYPE = 'filesystem'
        SESSION_COOKIE_HTTPONLY = True
        SESSION_COOKIE_SAMESITE = None
        SESSION_COOKIE_SECURE = False

        # Flask-Mail (Gmail SMTP)
        MAIL_SERVER = "smtp.gmail.com"
        MAIL_PORT = 587
        MAIL_USE_TLS = True
        MAIL_USERNAME = "Abdiaziznoor20@gmail.com"  # Your Gmail
        MAIL_PASSWORD = "tywlsprxunkzljml"         # Your App Password (without spaces)
        MAIL_DEFAULT_SENDER = "Abdiaziznoor20@gmail.com"

    app.config.from_object(Config)

    # Initialize extensions
    Session(app)
    db.init_app(app)
    mail.init_app(app)
    migrate = Migrate(app, db)
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ])

    # ---------------- BLUEPRINTS ----------------
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(email_bp, url_prefix='/api/email')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(admin_auth_bp, url_prefix='/api/admin')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(messages_bp, url_prefix='/api')

    # ---------------- CREATE DATABASE & DEFAULT ADMIN ----------------
    with app.app_context():
        db.create_all()
        create_default_admin_user()

    return app

# ---------------- RUN APP ----------------
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
