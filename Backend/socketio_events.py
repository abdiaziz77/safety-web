from flask_socketio import SocketIO, emit, join_room, leave_room
from models import db, ChatMessage, Chat, User, Notification, NotificationType, Report
from datetime import datetime
from flask import session, request
import json

socketio = SocketIO(cors_allowed_origins="*", manage_session=True)


def register_socket_events(app):
    socketio.init_app(app)

    @socketio.on("connect")
    def handle_connect():
        user_id = session.get("user_id")
        user_role = session.get("user_role")
        
        if not user_id:
            print("Unauthorized connection attempt")
            return False  # Reject connection

        print(f"User {user_id} ({user_role}) connected")
        
        # Join appropriate rooms
        join_room(f"user_{user_id}")
        if user_role == "admin":
            join_room("admin_room")
            join_room(f"admin_{user_id}")
        
        emit("connection_status", {
            "user_id": user_id,
            "role": user_role,
            "status": "connected"
        })

    @socketio.on("disconnect")
    def handle_disconnect():
        user_id = session.get("user_id")
        user_role = session.get("user_role")
        print(f"User {user_id} ({user_role}) disconnected")

    # Notification Socket Events
    @socketio.on("join_notifications")
    def handle_join_notifications():
        user_id = session.get("user_id")
        if not user_id:
            return False
        
        join_room(f"notifications_{user_id}")
        print(f"User {user_id} joined notifications room")

    @socketio.on("get_unread_count")
    def handle_get_unread_count():
        user_id = session.get("user_id")
        if not user_id:
            return False
        
        unread_count = Notification.query.filter_by(
            user_id=user_id, 
            is_read=False
        ).count()
        
        emit("unread_count_update", {
            "count": unread_count,
            "user_id": user_id
        }, room=f"notifications_{user_id}")

    @socketio.on("mark_notification_read")
    def handle_mark_notification_read(data):
        user_id = session.get("user_id")
        if not user_id:
            return False
        
        notification_id = data.get("notification_id")
        notification = Notification.query.get(notification_id)
        
        if notification and notification.user_id == user_id:
            notification.is_read = True
            db.session.commit()
            
            # Send updated unread count
            unread_count = Notification.query.filter_by(
                user_id=user_id, 
                is_read=False
            ).count()
            
            emit("notification_read", {
                "notification_id": notification_id,
                "success": True
            }, room=f"notifications_{user_id}")
            
            emit("unread_count_update", {
                "count": unread_count,
                "user_id": user_id
            }, room=f"notifications_{user_id}")

    @socketio.on("mark_all_notifications_read")
    def handle_mark_all_notifications_read():
        user_id = session.get("user_id")
        if not user_id:
            return False
        
        Notification.query.filter_by(user_id=user_id, is_read=False).update(
            {"is_read": True},
            synchronize_session=False
        )
        db.session.commit()
        
        emit("all_notifications_read", {
            "success": True,
            "user_id": user_id
        }, room=f"notifications_{user_id}")
        
        emit("unread_count_update", {
            "count": 0,
            "user_id": user_id
        }, room=f"notifications_{user_id}")

    @socketio.on("admin_send_notification")
    def handle_admin_send_notification(data):
        if session.get("user_role") != "admin":
            return False
        
        target_user_id = data.get("user_id")
        title = data.get("title")
        message = data.get("message")
        is_urgent = data.get("is_urgent", False)
        notification_type = data.get("type", "admin_alert")
        
        if not all([target_user_id, title, message]):
            emit("admin_notification_error", {
                "error": "Missing required fields"
            }, room=f"admin_{session.get('user_id')}")
            return
        
        try:
            notification = Notification(
                user_id=target_user_id,
                type=NotificationType(notification_type),
                title=title,
                message=message,
                is_urgent=is_urgent,
                action_url=data.get("action_url"),
                action_text=data.get("action_text"),
                related_user_id=session.get("user_id")
            )
            db.session.add(notification)
            db.session.commit()
            
            # Send real-time notification to user
            emit("new_notification", {
                "notification": notification.to_dict()
            }, room=f"notifications_{target_user_id}")
            
            # Update user's unread count
            unread_count = Notification.query.filter_by(
                user_id=target_user_id, 
                is_read=False
            ).count()
            
            emit("unread_count_update", {
                "count": unread_count,
                "user_id": target_user_id
            }, room=f"notifications_{target_user_id}")
            
            emit("admin_notification_sent", {
                "success": True,
                "notification_id": notification.id,
                "user_id": target_user_id
            }, room=f"admin_{session.get('user_id')}")
            
        except Exception as e:
            emit("admin_notification_error", {
                "error": str(e)
            }, room=f"admin_{session.get('user_id')}")

    @socketio.on("admin_broadcast_alert")
    def handle_admin_broadcast_alert(data):
        if session.get("user_role") != "admin":
            return False
        
        title = data.get("title")
        message = data.get("message")
        is_urgent = data.get("is_urgent", True)
        
        if not all([title, message]):
            emit("admin_broadcast_error", {
                "error": "Title and message are required"
            }, room=f"admin_{session.get('user_id')}")
            return
        
        try:
            # Get all non-admin users
            users = User.query.filter_by(is_admin=False).all()
            notifications_created = 0
            
            for user in users:
                notification = Notification(
                    user_id=user.id,
                    type=NotificationType.EMERGENCY,
                    title=title,
                    message=message,
                    is_urgent=is_urgent,
                    action_url=data.get("action_url", "/alerts"),
                    action_text=data.get("action_text", "View Alert"),
                    related_user_id=session.get("user_id")
                )
                db.session.add(notification)
                notifications_created += 1
                
                # Send real-time notification to each user
                emit("new_notification", {
                    "notification": notification.to_dict()
                }, room=f"notifications_{user.id}")
                
                # Update each user's unread count
                unread_count = Notification.query.filter_by(
                    user_id=user.id, 
                    is_read=False
                ).count()
                
                emit("unread_count_update", {
                    "count": unread_count,
                    "user_id": user.id
                }, room=f"notifications_{user.id}")
            
            db.session.commit()
            
            emit("admin_broadcast_success", {
                "success": True,
                "recipients": notifications_created,
                "message": f"Alert sent to {notifications_created} users"
            }, room=f"admin_{session.get('user_id')}")
            
        except Exception as e:
            emit("admin_broadcast_error", {
                "error": str(e)
            }, room=f"admin_{session.get('user_id')}")

    @socketio.on("subscribe_to_report")
    def handle_subscribe_to_report(data):
        user_id = session.get("user_id")
        report_id = data.get("report_id")
        
        if not user_id or not report_id:
            return False
        
        # Verify user has access to this report
        report = Report.query.get(report_id)
        if not report or (report.user_id != user_id and session.get("user_role") != "admin"):
            return False
        
        join_room(f"report_{report_id}")
        print(f"User {user_id} subscribed to report {report_id}")

    # Helper function to send real-time notifications
    def send_notification(user_id, notification_data):
        """Send a real-time notification to a specific user"""
        emit("new_notification", {
            "notification": notification_data
        }, room=f"notifications_{user_id}")
        
        # Update unread count
        unread_count = Notification.query.filter_by(
            user_id=user_id, 
            is_read=False
        ).count()
        
        emit("unread_count_update", {
            "count": unread_count,
            "user_id": user_id
        }, room=f"notifications_{user_id}")

    def notify_report_status_change(report_id, old_status, new_status, admin_id=None):
        """Notify user about report status change"""
        report = Report.query.get(report_id)
        if not report:
            return False
        
        notification = Notification(
            user_id=report.user_id,
            type=NotificationType.REPORT_STATUS_UPDATE,
            title="Report Status Updated",
            message=f'Your report "{report.title}" status changed from {old_status} to {new_status}',
            report_id=report_id,
            action_url=f'/reports/{report_id}',
            action_text="View Report",
            related_user_id=admin_id
        )
        db.session.add(notification)
        db.session.commit()
        
        # Send real-time notification
        send_notification(report.user_id, notification.to_dict())
        return True

    def notify_new_report(report_id):
        """Notify admins about new report"""
        report = Report.query.get(report_id)
        if not report:
            return False
        
        admins = User.query.filter_by(is_admin=True).all()
        for admin in admins:
            notification = Notification(
                user_id=admin.id,
                type=NotificationType.NEW_REPORT,
                title="New Report Submitted",
                message=f'New report "{report.title}" submitted by {report.author.first_name} {report.author.last_name}',
                report_id=report_id,
                action_url=f'/admin/reports/{report_id}',
                action_text="Review Report",
                related_user_id=report.user_id,
                is_urgent=(report.urgency in ['high', 'critical'])
            )
            db.session.add(notification)
            send_notification(admin.id, notification.to_dict())
        
        db.session.commit()
        return True

    def notify_new_user(user_id):
        """Notify admins about new user registration"""
        user = User.query.get(user_id)
        if not user:
            return False
        
        admins = User.query.filter_by(is_admin=True).all()
        for admin in admins:
            notification = Notification(
                user_id=admin.id,
                type=NotificationType.NEW_USER,
                title="New User Registered",
                message=f'New user registered: {user.first_name} {user.last_name} ({user.email})',
                related_user_id=user_id,
                action_url=f'/admin/users/{user_id}',
                action_text="View User"
            )
            db.session.add(notification)
            send_notification(admin.id, notification.to_dict())
        
        db.session.commit()
        return True

    # Existing chat events
    @socketio.on("send_message")
    def handle_send_message(data):
        user_id = session.get("user_id")
        user_role = session.get("user_role")
        
        if not user_id:
            return False

        chat_id = data.get("chat_id")
        content = data.get("content")
        
        if not chat_id or not content:
            return

        # Verify user has access to this chat
        chat = Chat.query.get(chat_id)
        if not chat or (user_role != "admin" and chat.user_id != user_id):
            return False

        # Create and save message
        message = ChatMessage(
            chat_id=chat_id,
            sender_id=user_id,
            content=content,
            is_admin=(user_role == "admin")
        )
        db.session.add(message)
        chat.updated_at = datetime.utcnow()
        db.session.commit()

        # Create notification for the recipient
        recipient_id = chat.admin_id if user_role == "admin" else chat.user_id
        if recipient_id:
            notification = Notification(
                user_id=recipient_id,
                type=NotificationType.CHAT_MESSAGE,
                title="New Chat Message",
                message=f'New message: {content[:100]}...',
                chat_id=chat_id,
                action_url=f'/chat/{chat_id}',
                action_text="Open Chat",
                related_user_id=user_id
            )
            db.session.add(notification)
            db.session.commit()
            
            # Send real-time notification
            send_notification(recipient_id, notification.to_dict())

        # Emit to both participants
        emit("new_message", {
            "id": message.id,
            "chat_id": message.chat_id,
            "sender_id": message.sender_id,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
            "is_admin": message.is_admin
        }, room=f"chat_{chat_id}")

    @socketio.on("admin_send_message")
    def handle_admin_send_message(data):
        admin_id = session.get("user_id")
        if session.get("user_role") != "admin":
            return False

        user_id = data.get("user_id")
        content = data.get("content")
        
        if not user_id or not content:
            return

        # Find or create chat
        chat = Chat.query.filter_by(user_id=user_id).first()
        if not chat:
            chat = Chat(
                user_id=user_id,
                admin_id=admin_id,
                title=f"Support Chat with User {user_id}"
            )
            db.session.add(chat)
            db.session.commit()

        # Create message
        message = ChatMessage(
            chat_id=chat.id,
            sender_id=admin_id,
            content=content,
            is_admin=True
        )
        db.session.add(message)
        chat.updated_at = datetime.utcnow()
        db.session.commit()

        # Create notification for user
        notification = Notification(
            user_id=user_id,
            type=NotificationType.CHAT_MESSAGE,
            title="New Message from Admin",
            message=f'New message: {content[:100]}...',
            chat_id=chat.id,
            action_url=f'/chat/{chat.id}',
            action_text="Open Chat",
            related_user_id=admin_id
        )
        db.session.add(notification)
        db.session.commit()
        
        # Send real-time notification
        send_notification(user_id, notification.to_dict())

        # Notify both admin and user
        emit("new_message", {
            "id": message.id,
            "chat_id": message.chat_id,
            "sender_id": message.sender_id,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
            "is_admin": True
        }, room=f"chat_{chat.id}")

    @socketio.on("join_chat")
    def handle_join_chat(chat_id):
        user_id = session.get("user_id")
        user_role = session.get("user_role")
        
        if not user_id:
            return False

        # Verify user has access to this chat
        chat = Chat.query.get(chat_id)
        if not chat or (user_role != "admin" and chat.user_id != user_id):
            return False

        join_room(f"chat_{chat_id}")
        print(f"User {user_id} joined chat {chat_id}")

    @socketio.on("admin_get_chats")
    def handle_admin_get_chats():
        if session.get("user_role") != "admin":
            return False

        # Get all active chats for admin
        chats = Chat.query.filter_by(is_active=True).all()
        emit("admin_chat_list", {
            "chats": [{
                "id": chat.id,
                "user_id": chat.user_id,
                "title": chat.title,
                "unread_count": ChatMessage.query.filter_by(
                    chat_id=chat.id,
                    is_read=False,
                    is_admin=False
                ).count()
            } for chat in chats]
        })