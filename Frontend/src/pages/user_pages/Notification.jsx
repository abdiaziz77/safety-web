// UserNotifications.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, User, FileText, AlertCircle, ArrowLeft, X, Filter, Search, Mail, AlertTriangle, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for real-time updates (every 10 seconds)
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/user`, {
        params: {
          page,
          per_page: 20,
          unread_only: filter === 'unread'
        },
        withCredentials: true
      });
      
      if (page === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      
      setUnreadCount(response.data.unread_count);
      setHasMore(response.data.pages > page);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setIsLoading(false);
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/read-all`, {}, {
        withCredentials: true
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "report_status_update":
        return <FileText className="text-blue-500" size={20} />;
      case "admin_alert":
        return <AlertCircle className="text-yellow-500" size={20} />;
      case "emergency":
        return <AlertTriangle className="text-red-500" size={20} />;
      case "chat_message":
        return <MessageSquare className="text-green-500" size={20} />;
      case "message":
        return <Mail className="text-purple-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "report_status_update":
        return "bg-blue-100 text-blue-800";
      case "admin_alert":
        return "bg-yellow-100 text-yellow-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      case "chat_message":
        return "bg-green-100 text-green-800";
      case "message":
        return "bg-purple-100 text-purple-800";
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
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.is_read) ||
      (filter === 'urgent' && notification.is_urgent);
    
    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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
              {selectedNotification.action_text || 'Take Action'}
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Notification Type</h4>
            <p className="text-gray-800 capitalize">{selectedNotification.type.replace(/_/g, ' ')}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Received</h4>
            <p className="text-gray-800">{new Date(selectedNotification.created_at).toLocaleString()}</p>
          </div>
          
          {selectedNotification.is_urgent && (
            <div className="bg-red-50 rounded-lg p-4 col-span-2">
              <div className="flex items-center">
                <AlertTriangle size={16} className="text-red-500 mr-2" />
                <span className="text-red-700 font-medium">Urgent Notification</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // List View
  const renderListView = () => {
    return (
      <div className="bg-white rounded-lg shadow-md max-w-4xl mx-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <Bell className="text-blue-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount} unread
                </span>
              )}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Check size={16} className="mr-1" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <div className="flex space-x-1">
                {['all', 'unread', 'urgent'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => handleFilterChange(filterType)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === filterType
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-400">
                {filter === 'unread' 
                  ? 'You\'re all caught up!' 
                  : 'Notifications will appear here'
                }
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
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
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type)}`}>
                            {notification.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 flex items-center">
                            <Clock size={12} className="mr-1" />
                            {formatTime(notification.created_at)}
                          </p>
                          
                          {notification.is_urgent && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle size={10} className="mr-1" />
                              Urgent
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
              
              {hasMore && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={loadMore}
                    className="w-full text-center text-blue-600 hover:text-blue-800 font-medium py-2"
                  >
                    Load more notifications
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your reports and messages</p>
        </div>
        
        {view === 'detail' ? renderDetailView() : renderListView()}
      </div>
    </div>
  );
};

export default UserNotifications;