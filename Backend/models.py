from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from sqlalchemy import Boolean, Enum
import uuid
import enum

# ------------------ ENUMS ------------------
class NotificationType(enum.Enum):
    REPORT_STATUS_UPDATE = "report_status_update"
    NEW_REPORT = "new_report"
    NEW_USER = "new_user"
    ADMIN_ALERT = "admin_alert"
    EMERGENCY = "emergency"
    MESSAGE = "message"
    CHAT_MESSAGE = "chat_message"
    REPORT_ASSIGNED = "report_assigned"
    NEW_MESSAGE = "new_message" 

# ------------------ USER MODEL ------------------
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    signup_otp = db.Column(db.String(6), nullable=True)
    signup_otp_expiry = db.Column(db.DateTime, nullable=True)
    is_verified = db.Column(db.Boolean, default=False)

    otp = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)

    # Profile fields
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
    reports = db.relationship(
        'Report', back_populates='author',
        lazy=True, foreign_keys='Report.user_id',
        cascade="all, delete-orphan", passive_deletes=True
    )
    admin_reports = db.relationship(
        'Report', back_populates='admin_user',
        lazy=True, foreign_keys='Report.admin_id',
        cascade="all, delete-orphan", passive_deletes=True
    )
    notifications = db.relationship(
        'Notification', back_populates='user',
        lazy=True, foreign_keys='Notification.user_id',
        cascade="all, delete-orphan", passive_deletes=True
    )
    alerts = db.relationship(
        'Alert', back_populates='creator',
        lazy=True, foreign_keys='Alert.created_by',
        cascade="all, delete-orphan", passive_deletes=True
    )
    chat_messages = db.relationship(
        'ChatMessage', back_populates='sender',
        lazy=True, foreign_keys='ChatMessage.sender_id',
        cascade="all, delete-orphan", passive_deletes=True
    )
    user_chats = db.relationship(
        'Chat', back_populates='user',
        lazy=True, foreign_keys='Chat.user_id',
        cascade="all, delete-orphan", passive_deletes=True
    )
    admin_chats = db.relationship(
        'Chat', back_populates='admin',
        lazy=True, foreign_keys='Chat.admin_id',
        cascade="all, delete-orphan", passive_deletes=True
    )

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'is_admin': self.is_admin,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'address_line_1': self.address_line_1,
            'address_line_2': self.address_line_2,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'country': self.country,
            'language': self.language,
            'time_zone': self.time_zone,
            'theme': self.theme
        }

# ------------------ REPORT MODEL ------------------
class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"))
    report_type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    urgency = db.Column(db.String(20), nullable=False, default='medium')
    status = db.Column(db.String(20), nullable=False, default='Pending')
    location = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    location_type = db.Column(db.String(50), nullable=False, default='public')
    location_details = db.Column(db.Text)
    witnesses = db.Column(db.Boolean, default=False)
    witness_details = db.Column(db.Text)
    evidence_available = db.Column(db.Boolean, default=False)
    evidence_details = db.Column(db.Text)
    police_involved = db.Column(db.Boolean, default=False)
    police_details = db.Column(db.Text)
    admin_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = db.relationship('User', back_populates='reports', foreign_keys=[user_id])
    admin_user = db.relationship('User', back_populates='admin_reports', foreign_keys=[admin_id])
    media = db.relationship('ReportMedia', back_populates='report', lazy=True, cascade='all, delete-orphan', passive_deletes=True)
    notifications = db.relationship('Notification', back_populates='report', lazy=True, cascade="all, delete-orphan", passive_deletes=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'admin_id': self.admin_id,
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
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'author': self.author.to_dict() if self.author else None,
            'admin_user': self.admin_user.to_dict() if self.admin_user else None,
            'media': [m.to_dict() for m in self.media]
        }

# ------------------ NOTIFICATION MODEL ------------------
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    related_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"))
    report_id = db.Column(db.String(36), db.ForeignKey('reports.id', ondelete="CASCADE"))
    alert_id = db.Column(db.String(36), db.ForeignKey('alerts.id', ondelete="CASCADE"))
    chat_id = db.Column(db.String(36), db.ForeignKey('chats.id', ondelete="CASCADE"))
    type = db.Column(Enum(NotificationType), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(Boolean, default=False)
    is_urgent = db.Column(Boolean, default=False)
    action_url = db.Column(db.String(500))
    action_text = db.Column(db.String(100))
    role = db.Column(db.String(10), nullable=False, default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)

    user = db.relationship('User', back_populates='notifications', foreign_keys=[user_id])
    related_user = db.relationship('User', foreign_keys=[related_user_id])
    report = db.relationship('Report', back_populates='notifications')
    alert = db.relationship('Alert', back_populates='notifications')
    chat = db.relationship('Chat', back_populates='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'related_user_id': self.related_user_id,
            'report_id': self.report_id,
            'alert_id': self.alert_id,
            'chat_id': self.chat_id,
            'type': self.type.value,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'is_urgent': self.is_urgent,
            'action_url': self.action_url,
            'action_text': self.action_text,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'user': self.user.to_dict() if self.user else None,
            'related_user': self.related_user.to_dict() if self.related_user else None,
            'report': self.report.to_dict() if self.report else None,
            'alert': self.alert.to_dict() if self.alert else None,
            'chat': self.chat.to_dict() if self.chat else None
        }

# ------------------ ALERT MODEL ------------------
class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Active')
    severity = db.Column(db.String(20), nullable=False, default='Medium')
    affected_area = db.Column(db.String(255))
    start_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = db.relationship('User', back_populates='alerts', foreign_keys=[created_by])
    notifications = db.relationship('Notification', back_populates='alert', lazy=True, cascade="all, delete-orphan", passive_deletes=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'status': self.status,
            'severity': self.severity,
            'affected_area': self.affected_area,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_by': self.created_by,
            'creator': self.creator.to_dict() if self.creator else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# ------------------ REPORT MEDIA MODEL ------------------
class ReportMedia(db.Model):
    __tablename__ = 'report_media'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = db.Column(db.String(36), db.ForeignKey('reports.id', ondelete="CASCADE"), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(100))
    size = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    report = db.relationship('Report', back_populates='media')

    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'url': self.url,
            'type': self.type,
            'name': self.name,
            'size': self.size,
            'created_at': self.created_at.isoformat()
        }

# ------------------ CHAT MODELS ------------------
class Chat(db.Model):
    __tablename__ = 'chats'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"))
    title = db.Column(db.String(100), nullable=False, default='Support Chat')
    status = db.Column(db.String(20), nullable=False, default='open')
    is_active = db.Column(Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', back_populates='user_chats', foreign_keys=[user_id])
    admin = db.relationship('User', back_populates='admin_chats', foreign_keys=[admin_id])
    messages = db.relationship('ChatMessage', back_populates='chat', lazy='dynamic', cascade='all, delete-orphan', passive_deletes=True)
    notifications = db.relationship('Notification', back_populates='chat', lazy=True, cascade="all, delete-orphan", passive_deletes=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.to_dict() if self.user else None,
            'admin': self.admin.to_dict() if self.admin else None,
            'title': self.title,
            'status': self.status,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'unread_count': self.messages.filter((ChatMessage.is_read == False) & (ChatMessage.sender_id != self.user_id)).count()
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = db.Column(db.String(36), db.ForeignKey('chats.id', ondelete="CASCADE"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(Boolean, default=False)
    is_admin = db.Column(Boolean, default=False)
    message_type = db.Column(db.String(20), default='text')
    attachment_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    chat = db.relationship('Chat', back_populates='messages')
    sender = db.relationship('User', back_populates='chat_messages')

    def to_dict(self):
        return {
            'id': self.id,
            'chat_id': self.chat_id,
            'sender': self.sender.to_dict() if self.sender else None,
            'content': self.content,
            'is_read': self.is_read,
            'is_admin': self.is_admin,
            'message_type': self.message_type,
            'attachment_url': self.attachment_url,
            'created_at': self.created_at.isoformat()
        }

# ------------------ SENT EMAIL MODEL ------------------
class SentEmail(db.Model):
    __tablename__ = 'sent_emails'

    id = db.Column(db.Integer, primary_key=True)
    recipient = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'recipient': self.recipient,
            'subject': self.subject,
            'message': self.message,
            'sent_at': self.sent_at.isoformat()
        }

# ------------------ ADMIN USER MODEL ------------------
class AdminUser(db.Model):
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }
# ------------------ MESSAGE MODEL ------------------
class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='new')  # new, in_progress, resolved, closed
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    assigned_admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    response = db.Column(db.Text, nullable=True)
    response_date = db.Column(db.DateTime, nullable=True)
    response_admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id])
    assigned_admin = db.relationship('User', foreign_keys=[assigned_admin_id])
    response_admin = db.relationship('User', foreign_keys=[response_admin_id])

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'title': self.title,
            'message': self.message,
            'status': self.status,
            'priority': self.priority,
            'user_id': self.user_id,
            'assigned_admin_id': self.assigned_admin_id,
            'response': self.response,
            'response_date': self.response_date.isoformat() if self.response_date else None,
            'response_admin_id': self.response_admin_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'user': self.user.to_dict() if self.user else None,
            'assigned_admin': self.assigned_admin.to_dict() if self.assigned_admin else None,
            'response_admin': self.response_admin.to_dict() if self.response_admin else None
        }

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    ticket_number = db.Column(db.String(20), unique=True, nullable=False)
    status = db.Column(db.String(20), default='new')  # new, in_progress, resolved, closed, reopened
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent

    # Relations
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    assigned_admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    response_admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"), nullable=True)

    # Response fields
    response = db.Column(db.Text, nullable=True)
    response_date = db.Column(db.DateTime, nullable=True)

    # Reopen tracking
    reopen_count = db.Column(db.Integer, default=0)
    reopen_notes = db.Column(db.Text, nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id])
    assigned_admin = db.relationship('User', foreign_keys=[assigned_admin_id])
    response_admin = db.relationship('User', foreign_keys=[response_admin_id])

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'ticket_number': self.ticket_number,
            'status': self.status,
            'priority': self.priority,
            'user_id': self.user_id,
            'assigned_admin_id': self.assigned_admin_id,
            'response': self.response,
            'response_date': self.response_date.isoformat() if self.response_date else None,
            'response_admin_id': self.response_admin_id,
            'reopen_count': self.reopen_count,
            'reopen_notes': self.reopen_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': self.user.to_dict() if self.user else None,
            'assigned_admin': self.assigned_admin.to_dict() if self.assigned_admin else None,
            'response_admin': self.response_admin.to_dict() if self.response_admin else None
        }
