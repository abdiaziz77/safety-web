import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiAlertCircle, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const notificationTypes = {
    'new_report': { label: 'New Reports', icon: FiAlertCircle, color: 'red' },
    'new_user': { label: 'New Users', icon: FiUserPlus, color: 'green' }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, typeFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/notifications/admin`;
      if (filter === 'unread') {
        url += `?unread_only=true`;
      }

      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        let filteredNotifications = data.notifications;

        // Only show new reports and new users
        filteredNotifications = filteredNotifications.filter(
          n => n.type === 'new_report' || n.type === 'new_user'
        );

        // Extra filter by type if selected
        if (typeFilter !== 'all') {
          filteredNotifications = filteredNotifications.filter(
            n => n.type === typeFilter
          );
        }

        setNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin/read-all`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllRead = async () => {
    if (!window.confirm('Are you sure you want to delete all read notifications?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin/delete-read`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => !n.is_read));
        toast.success('All read notifications deleted');
      }
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const typeConfig = notificationTypes[type];
    if (typeConfig) {
      const IconComponent = typeConfig.icon;
      return <IconComponent className={`text-${typeConfig.color}-500`} />;
    }
    return <FiBell />;
  };

  // Calculate unread count for UI display
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded shadow mb-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Notifications</h1>
              
              </div>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <FiCheck className="mr-2" />
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={deleteAllRead}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                >
                  <FiTrash2 className="mr-2" />
                  Delete Read
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded ${
                  filter === 'unread' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unread
              </button>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded"
              >
                <option value="all">All Types</option>
                {Object.entries(notificationTypes).map(([type, config]) => (
                  <option key={type} value={type}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <FiBell className="mx-auto text-gray-400 text-4xl mb-4" />
                <p className="text-gray-600">No notifications found</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-gray-500">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {notification.is_urgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            Urgent
                          </span>
                        )}
                        {!notification.is_read && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          className="text-blue-600 hover:text-blue-800 text-sm inline-block mt-2"
                        >
                          {notification.action_text || 'View details'}
                        </a>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Mark as read"
                        >
                          <FiCheck />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;