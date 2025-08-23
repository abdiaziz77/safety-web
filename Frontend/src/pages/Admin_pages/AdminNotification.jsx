// AdminNotifications.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, User, FileText, AlertCircle, ArrowLeft, X, Filter, Search, Mail, AlertTriangle, MessageSquare, Send, Users, Plus } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('all');
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendFormData, setSendFormData] = useState({
    title: '',
    message: '',
    is_urgent: false,
    user_ids: [],
    type: 'admin_alert'
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchNotifications();
      fetchStats();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/admin`, {
        params: { type: filter === 'all' ? undefined : filter },
        withCredentials: true
      });
      
      setNotifications(response.data.notifications);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/stats`, {
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
        withCredentials: true
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const sendNotification = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/admin/send`, sendFormData, {
        withCredentials: true
      });
      
      setShowSendForm(false);
      setSendFormData({
        title: '',
        message: '',
        is_urgent: false,
        user_ids: [],
        type: 'admin_alert'
      });
      
      alert('Notification sent successfully!');
    } catch (error) {
      console.error("Error sending notification:", error);
      alert('Error sending notification');
    }
  };

 const sendBroadcast = async () => {
  try {
    await axios.post(`${API_BASE_URL}/api/notifications/admin/send-alert`, {
      title: sendFormData.title,
      message: sendFormData.message,
      is_urgent: sendFormData.is_urgent,
      user_ids: [] // empty = broadcast
    }, { withCredentials: true });

    setShowSendForm(false);
    setSendFormData({
      title: '',
      message: '',
      is_urgent: false,
      user_ids: [],
      type: 'admin_alert'
    });

    alert('Broadcast sent successfully!');
  } catch (error) {
    console.error("Error sending broadcast:", error);
    alert('Error sending broadcast');
  }
};


  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setSelectedNotification(notification);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "report_status_update":
        return <FileText className="text-blue-500" size={20} />;
      case "new_report":
        return <FileText className="text-green-500" size={20} />;
      case "new_user":
        return <User className="text-purple-500" size={20} />;
      case "admin_alert":
        return <AlertCircle className="text-yellow-500" size={20} />;
      case "emergency":
        return <AlertTriangle className="text-red-500" size={20} />;
      case "chat_message":
        return <MessageSquare className="text-indigo-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "report_status_update":
        return "bg-blue-100 text-blue-800";
      case "new_report":
        return "bg-green-100 text-green-800";
      case "new_user":
        return "bg-purple-100 text-purple-800";
      case "admin_alert":
        return "bg-yellow-100 text-yellow-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      case "chat_message":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    return date.toLocaleDateString();
  };

  // Detail View
  const renderDetailView = () => {
    if (!selectedNotification) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToList}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Notification Details</h2>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-blue-100 mr-4">
                {getNotificationIcon(selectedNotification.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedNotification.title}
                </h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {formatTime(selectedNotification.created_at)}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNotificationColor(selectedNotification.type)}`}>
              {selectedNotification.type.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{selectedNotification.message}</p>
          </div>

          {selectedNotification.action_url && (
            <a
              href={selectedNotification.action_url}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {selectedNotification.action_text || 'View Details'}
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Type</h4>
            <p className="text-gray-800 capitalize">{selectedNotification.type.replace(/_/g, ' ')}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Received</h4>
            <p className="text-gray-800">{new Date(selectedNotification.created_at).toLocaleString()}</p>
          </div>
          
          {selectedNotification.related_user_id && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Related User</h4>
              <p className="text-gray-800">User #{selectedNotification.related_user_id}</p>
            </div>
          )}
          
          {selectedNotification.report_id && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Report ID</h4>
              <p className="text-gray-800">{selectedNotification.report_id}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Send Notification Form
  const renderSendForm = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Send Notification</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={sendFormData.title}
              onChange={(e) => setSendFormData({...sendFormData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={sendFormData.message}
              onChange={(e) => setSendFormData({...sendFormData, message: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Notification message"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={sendFormData.is_urgent}
              onChange={(e) => setSendFormData({...sendFormData, is_urgent: e.target.checked})}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Mark as urgent</label>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={sendNotification}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Send to User
            </button>
            
            <button
              onClick={sendBroadcast}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Broadcast to All
            </button>
            
            <button
              onClick={() => setShowSendForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // List View
  const renderListView = () => {
    return (
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <Bell className="text-blue-600 mr-3" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Admin Notifications</h2>
              <p className="text-sm text-gray-600">Manage system notifications</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSendForm(!showSendForm)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Send size={16} className="mr-2" />
            Send Notification
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
              <div className="text-sm text-gray-600">Total Notifications</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">{stats.unread || 0}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{stats.urgent || 0}</div>
              <div className="text-sm text-gray-600">Urgent</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.recent || 0}</div>
              <div className="text-sm text-gray-600">Last 7 Days</div>
            </div>
          </div>
        </div>

        {/* Send Form */}
        {showSendForm && renderSendForm()}

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <Filter size={16} className="text-gray-500" />
            <div className="flex space-x-1">
              {['all', 'new_report', 'new_user', 'chat_message'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filterType.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 px-6 text-center">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No notifications</h3>
              <p className="text-gray-400">Notifications will appear here</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`rounded-full p-2 flex-shrink-0 ${
                      !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type)}`}>
                          {notification.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatTime(notification.created_at)}
                        </p>
                        
                        {notification.related_user_id && (
                          <span className="text-xs text-gray-500">
                            User #{notification.related_user_id}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-2">Manage and monitor system notifications</p>
        </div>
        
        {view === 'detail' ? renderDetailView() : renderListView()}
      </div>
    </div>
  );
};

export default AdminNotifications;