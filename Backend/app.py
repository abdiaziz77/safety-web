from flask import Flask
from flask_cors import CORS
from flask_session import Session
from models import db, AdminUser  
from extensions import mail
from socketio_events import socketio, register_socket_events
from blueprints.auth import auth_bp
from blueprints.reports import reports_bp
from blueprints.email import email_bp
from blueprints.alerts import alerts_bp
from blueprints.admin import admin_auth_bp 
from blueprints.chat import chat_bp 
from blueprints.notification import notifications_bp

import os
from flask_migrate import Migrate


def create_default_admin_user():
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

    class Config:
        SECRET_KEY = os.getenv('SECRET_KEY', 'supersecretkey')
        SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
        SQLALCHEMY_TRACK_MODIFICATIONS = False
        SESSION_TYPE = 'filesystem'
        SESSION_COOKIE_HTTPONLY = True
        SESSION_COOKIE_SAMESITE = None
        SESSION_COOKIE_SECURE = False

        MAIL_SERVER = "smtp.gmail.com"
        MAIL_PORT = 587
        MAIL_USE_TLS = True
        MAIL_USERNAME = os.getenv("MAIL_USERNAME")
        MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
        MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")

    app.config.from_object(Config)

    Session(app)
    db.init_app(app)
    mail.init_app(app)
    migrate = Migrate(app, db)

    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ])

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(email_bp, url_prefix='/api/email')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(admin_auth_bp, url_prefix='/api/admin')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    with app.app_context():
        db.create_all()
        create_default_admin_user()   

    # Register socket events BEFORE returning the app
    register_socket_events(app)

    return app


if __name__ == "__main__":
    app = create_app()
    socketio.run(app, debug=True)
