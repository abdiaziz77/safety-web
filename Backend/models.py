from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from sqlalchemy import Boolean, Enum
import uuid
import enum

# Notification Types Enum
class NotificationType(enum.Enum):
    REPORT_STATUS_UPDATE = "report_status_update"
    NEW_REPORT = "new_report"
    NEW_USER = "new_user"
    ADMIN_ALERT = "admin_alert"
    EMERGENCY = "emergency"
    MESSAGE = "message"
    CHAT_MESSAGE = "chat_message"
    REPORT_ASSIGNED = "report_assigned"

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(Boolean, default=False)

    # New profile fields
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(10))
    address_line_1 = db.Column(db.String(200))
    address_line_2 = db.Column(db.String(200))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    country = db.Column(db.String(100))
    language = db.Column(db.String(50))
    time_zone = db.Column(db.String(50))
    theme = db.Column(db.String(20))

    # Relationships
    reports = db.relationship('Report', backref='author', lazy=True, foreign_keys='Report.user_id')
    notifications = db.relationship('Notification', backref='user', lazy=True, foreign_keys='Notification.user_id')
    alerts = db.relationship('Alert', backref='creator', lazy=True, foreign_keys='Alert.created_by')
    chat_messages = db.relationship('ChatMessage', backref='sender', lazy=True, foreign_keys='ChatMessage.sender_id')
    user_chats = db.relationship('Chat', backref='user', lazy=True, foreign_keys='Chat.user_id')
    admin_chats = db.relationship('Chat', backref='admin', lazy=True, foreign_keys='Chat.admin_id')
    admin_reports = db.relationship('Report', backref='admin_user', lazy=True, foreign_keys='Report.admin_id')

    def set_password(self, password: str):
        """Hashes and stores the password."""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        """Checks if the provided password matches the stored hash."""
        return check_password_hash(self.password_hash, password)

class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    report_type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    urgency = db.Column(db.String(20), nullable=False, default='medium')
    status = db.Column(db.String(20), nullable=False, default='Pending')
    
    # Location fields
    location = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    location_type = db.Column(db.String(50), nullable=False, default='public')
    location_details = db.Column(db.Text)
    
    # Incident details
    witnesses = db.Column(db.Boolean, default=False)
    witness_details = db.Column(db.Text)
    evidence_available = db.Column(db.Boolean, default=False)
    evidence_details = db.Column(db.Text)
    police_involved = db.Column(db.Boolean, default=False)
    police_details = db.Column(db.Text)
    
    # Admin fields
    admin_notes = db.Column(db.Text)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    media = db.relationship('ReportMedia', backref='report', lazy=True, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='report', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_email': self.author.email if self.author else None,
            'user_name': f"{self.author.first_name} {self.author.last_name}" if self.author else None,
            'report_type': self.report_type,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat(),
            'time': self.time.isoformat(),
            'urgency': self.urgency,
            'status': self.status,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'location_type': self.location_type,
            'location_details': self.location_details,
            'witnesses': self.witnesses,
            'witness_details': self.witness_details,
            'evidence_available': self.evidence_available,
            'evidence_details': self.evidence_details,
            'police_involved': self.police_involved,
            'police_details': self.police_details,
            'admin_notes': self.admin_notes,
            'admin_id': self.admin_id,
            'admin_name': f"{self.admin_user.first_name} {self.admin_user.last_name}" if self.admin_user else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'media': [media.to_dict() for media in self.media]
        }

# Add the Notification Model
class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(Enum(NotificationType), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(Boolean, default=False)
    is_urgent = db.Column(Boolean, default=False)
    
    # Foreign keys for different notification sources
    report_id = db.Column(db.String(36), db.ForeignKey('reports.id'))
    alert_id = db.Column(db.String(36), db.ForeignKey('alerts.id'))
    chat_id = db.Column(db.String(36), db.ForeignKey('chats.id'))
    related_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Action links
    action_url = db.Column(db.String(500))
    action_text = db.Column(db.String(100))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    
    # Relationships
    related_user = db.relationship('User', foreign_keys=[related_user_id])
    alert = db.relationship('Alert', backref='notifications')
    chat = db.relationship('Chat', backref='notifications')
    

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type.value,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'is_urgent': self.is_urgent,
            'report_id': self.report_id,
            'alert_id': self.alert_id,
            'chat_id': self.chat_id,
            'related_user_id': self.related_user_id,
            'related_user_name': f"{self.related_user.first_name} {self.related_user.last_name}" if self.related_user else None,
            'action_url': self.action_url,
            'action_text': self.action_text,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'time_ago': self.get_time_ago()
        }
    
    def get_time_ago(self):
        """Return human-readable time difference"""
        now = datetime.utcnow()
        diff = now - self.created_at
        
        if diff.days > 0:
            return f"{diff.days}d ago"
        elif diff.seconds > 3600:
            return f"{diff.seconds // 3600}h ago"
        elif diff.seconds > 60:
            return f"{diff.seconds // 60}m ago"
        else:
            return "Just now"

class ReportMedia(db.Model):
    __tablename__ = 'report_media'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = db.Column(db.String(36), db.ForeignKey('reports.id'), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'image', 'video', 'audio'
    name = db.Column(db.String(100))
    size = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'type': self.type,
            'name': self.name,
            'size': self.size
        }

class SentEmail(db.Model):
    __tablename__ = 'sent_emails'

    id = db.Column(db.Integer, primary_key=True)
    recipient = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SentEmail {self.subject}>"

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # General, Emergency, Weather, etc.
    status = db.Column(db.String(20), nullable=False, default='Active')  # Active, Inactive, Resolved
    severity = db.Column(db.String(20), nullable=False, default='Medium')  # Low, Medium, High, Critical
    affected_area = db.Column(db.String(255))
    start_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'status': self.status,
            'severity': self.severity,
            'affected_area': self.affected_area,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_by': self.created_by,
            'creator_email': self.creator.email,
            'creator_name': f"{self.creator.first_name} {self.creator.last_name}",
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AdminUser(db.Model):
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Hashes and stores the password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifies the password."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "created_at": self.created_at.isoformat()
        }

class Chat(db.Model):
    __tablename__ = 'chats'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.String(100), nullable=False, default='Support Chat')
    status = db.Column(db.String(20), nullable=False, default='open')  # open, closed, pending
    is_active = db.Column(Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='chat', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        unread_count = self.messages.filter(
            (ChatMessage.is_read == False) & (ChatMessage.sender_id != self.user_id)
        ).count()

        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': f"{self.user.first_name} {self.user.last_name}",
            'admin_id': self.admin_id,
            'admin_name': f"{self.admin.first_name} {self.admin.last_name}" if self.admin else None,
            'title': self.title,
            'status': self.status,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'unread_count': unread_count
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = db.Column(db.String(36), db.ForeignKey('chats.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(Boolean, default=False)
    is_admin = db.Column(Boolean, default=False)  # Flag for admin messages
    
    # For message types (text, image, file, etc.)
    message_type = db.Column(db.String(20), default='text')
    attachment_url = db.Column(db.String(255))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
   

    def to_dict(self):
        return {
            'id': self.id,
            'chat_id': self.chat_id,
            'sender_id': self.sender_id,
            'sender_name': f"{self.sender.first_name} {self.sender.last_name}",
            'sender_email': self.sender.email,
            'content': self.content,
            'is_read': self.is_read,
            'is_admin': self.is_admin,
            'message_type': self.message_type,
            'attachment_url': self.attachment_url,
            'created_at': self.created_at.isoformat()
        }