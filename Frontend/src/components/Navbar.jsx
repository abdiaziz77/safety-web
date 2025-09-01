import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Bell, User, LogOut, ChevronDown, X, MessageSquare } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [mobileMenuSection, setMobileMenuSection] = useState('main'); // 'main' or 'getInTouch'
  const [showLogoutModal, setShowLogoutModal] = useState(false); // New state for logout modal

  // Helper functions that need to be defined early
  const getNotificationPath = () => (user?.role === 'admin' ? '/admin/dashboard/notification' : '/dashboard/notification');
  const getChatPath = () => (user?.role === 'admin' ? '/admin/dashboard/chats' : '/dashboard/chat');

  // Fetch counts and recent notifications
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        // Fetch notification count - FIXED ENDPOINT
        const notifResponse = await axios.get('/api/notifications/unread-count', { withCredentials: true });
        setNotificationCount(notifResponse.data.unread_count || 0);
        
        // Fetch unread messages count
        const messagesResponse = await axios.get('/api/chat/unread_count', { withCredentials: true });
        setUnreadMessagesCount(messagesResponse.data.total_unread_messages || 0);
        
        // Fetch recent notifications for dropdown - FIXED ENDPOINT
        if (isNotificationDropdownOpen) {
          const recentNotifResponse = await axios.get('/api/notifications/user?per_page=5', { withCredentials: true });
          setRecentNotifications(recentNotifResponse.data.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
        // Initialize counts to 0 if there's an error
        setNotificationCount(0);
        setUnreadMessagesCount(0);
      }
    };

    // Initial fetch
    fetchCounts();

    // Poll every 30 seconds
    const interval = setInterval(fetchCounts, 30000);

    return () => clearInterval(interval);
  }, [user, isNotificationDropdownOpen]);

  // Reset chat count when on chat page
  useEffect(() => {
    const checkIfOnChatPage = () => {
      const chatPath = getChatPath();
      const currentPath = window.location.pathname;
      return currentPath.includes(chatPath);
    };

    if (checkIfOnChatPage() && unreadMessagesCount > 0) {
      // User is on chat page, mark messages as read
      const markMessagesAsRead = async () => {
        try {
          await axios.put('/api/chat/mark_all_read', {}, { withCredentials: true });
          setUnreadMessagesCount(0);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      };
      markMessagesAsRead();
    }
  }, [unreadMessagesCount, user]);

  // Reset notification count when on notification page
  useEffect(() => {
    const checkIfOnNotificationPage = () => {
      const notificationPath = getNotificationPath();
      const currentPath = window.location.pathname;
      return currentPath.includes(notificationPath);
    };

    if (checkIfOnNotificationPage() && notificationCount > 0) {
      // User is on notification page, mark notifications as read
      const markNotificationsAsRead = async () => {
        try {
          await axios.put('/api/notifications/read-all', {}, { withCredentials: true });
          setNotificationCount(0);
        } catch (error) {
          console.error('Error marking notifications as read:', error);
        }
      };
      markNotificationsAsRead();
    }
  }, [notificationCount, user]);

  // Function to fetch recent notifications - FIXED ENDPOINT
  const fetchRecentNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications/user?per_page=5', { withCredentials: true });
      setRecentNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
    }
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = async () => {
    if (!isNotificationDropdownOpen) {
      await fetchRecentNotifications();
    }
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    
    // Mark notifications as read when dropdown is opened
    if (!isNotificationDropdownOpen && notificationCount > 0) {
      try {
        await axios.put('/api/notifications/read-all', {}, { withCredentials: true });
        setNotificationCount(0);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  // Handle navigation to chat and mark messages as read
  const handleChatNavigation = async () => {
    try {
      // Mark messages as read before navigating
      if (unreadMessagesCount > 0) {
        await axios.put('/api/chat/mark_all_read', {}, { withCredentials: true });
      }
      // Reset the count immediately for better UX
      setUnreadMessagesCount(0);
      navigate(getChatPath());
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Still navigate even if there's an error
      navigate(getChatPath());
    }
  };

  if (loading) return null;

  const navigateTo = (path) => {
    setIsMobileMenuOpen(false);
    setMobileMenuSection('main');
    navigate(path);
  };

  // Logout functions
  const handleLogoutConfirmation = () => {
    setIsDesktopDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    try {
      setShowLogoutModal(false);
      await logout(); // clears user in AuthContext
      toast.success("Logged out successfully", { position: "top-center" });
      navigate("/login", { replace: true }); // instant redirect
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const getNotificationIcon = () => <Bell className="w-5 h-5" />;
  const getChatIcon = () => <MessageSquare className="w-5 h-5" />;

  // Helper function to render notification badge
  const renderNotificationBadge = (count) => {
    if (count > 0) {
      return (
        <span className="absolute top-0 right-0 text-xs rounded-full h-5 w-5 flex items-center justify-center bg-red-500 text-white animate-pulse">
          {count > 99 ? '99+' : count}
        </span>
      );
    }
    // Show red dot when there are no notifications but we want to indicate the icon
    return (
      <span className="absolute top-0 right-0 text-xs rounded-full h-2 w-2 flex items-center justify-center bg-red-500"></span>
    );
  };

  // Helper function to render message badge
  const renderMessageBadge = (count) => {
    if (count > 0) {
      return (
        <span className="absolute top-0 right-0 text-xs rounded-full h-5 w-5 flex items-center justify-center bg-red-500 text-white animate-pulse">
          {count > 99 ? '99+' : count}
        </span>
      );
    }
    // Show red dot when there are no messages but we want to indicate the icon
    return (
      <span className="absolute top-0 right-0 text-xs rounded-full h-2 w-2 flex items-center justify-center bg-red-500"></span>
    );
  };

  return (
    <>
      <ToastContainer position="top-center" />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Confirm Logout</h3>
            <p className="text-gray-700 mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Glassmorphism Header */}
      <header className="bg-white/5 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10 shadow-sm shadow-blue-100/20">
        {/* Emergency Bar with gradient */}
        <div className="bg-gradient-to-r from-blue-700/95 to-blue-800/95 backdrop-blur-sm text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-7">
            <div className="flex justify-between items-center h-10 py-2 ">
              <div className="flex items-center space-x-10 text-sm font-bold">
                <span>🚨 EMERGENCY: CALL 101</span>
                <span className="hidden md:inline">📞 Non-emergency: 555-SAFE</span>
              </div>
              {!user && (
                <div className="flex items-center space-x-6">
                  <Link to="/login" className="text-bold hover:text-blue-200 font-bold">
                    LOGIN
                  </Link>
                  <Link
                    to="/signup"
                    className="text-bold text-blue-600 bg-white hover:bg-white/30 px-3 py-1 rounded font-medium transition-all"
                  >
                    SIGN UP
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Nav with Tabs */}
        <nav className="bg-white/5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
            <div className="flex justify-between items-center h-16 ">
              {/* Logo with fallback - Combined into one container */}
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-3 group">
                  {!logoError && (
                    <img
                      src="/src/assets/image/logo.png"
                      alt="SafeZone101 Logo"
                      className="h-10 w-10 mr-2"
                      onError={() => setLogoError(true)}
                    />
                  )}
                  {logoError && (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600/90 to-blue-800/90 shadow-lg text-white font-bold text-xl">
                      SZ
                    </div>
                  )}
                  {/* Text next to logo */}
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-gray-800">SafeZone101</h1>
                    <p className="text-xs text-gray-600">Community Safety Hub</p>
                  </div>
                </Link>

                {/* Second logo - now properly spaced */}
                <Link to="/" className="flex items-center space-x-3 group">
                  {!logoError && (
                    <img
                      src="/src/assets/image/logo3.png"
                      alt="SafeZone101 Logo"
                      className="h-10 w-10 mr-2"
                      onError={() => setLogoError(true)}
                    />
                  )}
                  {/* Text next to logo */}
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-gray-800">Republic Of Kenya</h1>
                    <p className="text-xs text-gray-600">Service With Dignity</p>
                  </div>
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-2">
                {user ? (
                  <>
                    {/* Notification & Chat Icons */}
                    <div className="flex items-center space-x-1 bg-white/10 rounded-full p-1">
                      <button
                        onClick={handleChatNavigation}
                        className="p-2 rounded-full hover:bg-white/20 relative transition-all"
                      >
                        {getChatIcon()}
                        {renderMessageBadge(unreadMessagesCount)}
                      </button>
                      
                      {/* Notification Dropdown */}
                      <div className="relative">
                        <button
                          onClick={toggleNotificationDropdown}
                          className="p-2 rounded-full hover:bg-white/20 relative"
                        >
                          {getNotificationIcon()}
                          {renderNotificationBadge(notificationCount)}
                        </button>

                        {isNotificationDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-lg rounded-lg shadow-xl py-2 z-50 border border-white/20">
                            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                              <h3 className="font-semibold text-gray-800">Notifications</h3>
                              <Link 
                                to={getNotificationPath()}
                                className="text-sm text-blue-600 hover:text-blue-800"
                                onClick={() => {
                                  setIsNotificationDropdownOpen(false);
                                  setNotificationCount(0);
                                }}
                              >
                                View All
                              </Link>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                              {recentNotifications.length > 0 ? (
                                recentNotifications.map(notification => (
                                  <div key={notification.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80">
                                    <div className="flex justify-between">
                                      <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                                      <span className="text-xs text-gray-500">
                                        {new Date(notification.created_at).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-6 text-center text-gray-500">
                                  No notifications
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Dropdown */}
                    <div className="relative">
                      <button
                        className="flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
                        onClick={() => setIsDesktopDropdownOpen(!isDesktopDropdownOpen)}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100/80 flex items-center justify-center text-blue-600 font-medium border border-white/20">
                          {user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                          Hello, {user.firstName} {user.lastName}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isDesktopDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isDesktopDropdownOpen && (
                        <div
                          className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl py-1 z-50 border border-white/20"
                          onMouseLeave={() => setIsDesktopDropdownOpen(false)}
                        >
                          {user.role === 'admin' ? (
                            <button
                              onClick={handleLogoutConfirmation}
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100/80 w-full text-left"
                            >
                              <LogOut className="w-4 h-4 mr-2 text-red-500" />
                              Logout
                            </button>
                          ) : (
                            <>
                              <Link
                                to="/dashboard/settings"
                                className="flex items-center px-4 py-3 text-sm hover:bg-gray-100/80"
                                onClick={() => setIsDesktopDropdownOpen(false)}
                              >
                                <User className="w-4 h-4 mr-2 text-blue-500" />
                                My Profile
                              </Link>
                              <button
                                onClick={handleLogoutConfirmation}
                                className="flex items-center px-4 py-3 text-sm hover:bg-gray-100/80 w-full text-left border-t border-white/10"
                              >
                                <LogOut className="w-4 h-4 mr-2 text-red-500" />
                                Logout
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Public Tabs
                  <div className="flex bg-white/10 rounded-lg p-1 space-x-1 border border-white/10">
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          isActive ? 'bg-white shadow-sm text-blue-600' : 'text-gray-700 hover:bg-white/20'
                        }`
                      }
                    >
                      Home
                    </NavLink>
                    <NavLink
                      to="/emergency"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          isActive ? 'bg-white shadow-sm text-blue-600' : 'text-gray-700 hover:bg-white/20'
                        }`
                      }
                    >
                      Emergency
                    </NavLink>
                    <NavLink
                      to="/community"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          isActive ? 'bg-white shadow-sm text-blue-600' : 'text-gray-700 hover:bg-white/20'
                        }`
                      }
                    >
                      Community
                    </NavLink>
                    <NavLink
                      to="/safety-tips"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          isActive ? 'bg-white shadow-sm text-blue-600' : 'text-gray-700 hover:bg-white/20'
                        }`
                      }
                    >
                      Safety Tips
                    </NavLink>

                    {/* Get in Touch Dropdown */}
                    <div className="relative">
                      <button
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white/20 transition-all flex items-center"
                        onClick={() => setIsGetInTouchOpen(!isGetInTouchOpen)}
                        onMouseEnter={() => setIsGetInTouchOpen(true)}
                      >
                        Get in Touch <ChevronDown className="w-4 h-4 ml-1" />
                      </button>

                      {isGetInTouchOpen && (
                        <div
                          className="absolute right-0 mt-1 w-48 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl py-1 z-50 border border-white/20"
                          onMouseLeave={() => setIsGetInTouchOpen(false)}
                        >
                          <Link
                            to="/about"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80"
                            onClick={() => setIsGetInTouchOpen(false)}
                          >
                            About
                          </Link>
                          <Link
                            to="/faqs"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80"
                            onClick={() => setIsGetInTouchOpen(false)}
                          >
                            FAQs
                          </Link>
                          <Link
                            to="/contact"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80"
                            onClick={() => setIsGetInTouchOpen(false)}
                          >
                            Contact Us
                          </Link>
                          <Link
                            to="/feedback"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80"
                            onClick={() => setIsGetInTouchOpen(false)}
                          >
                            Feedback
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-2">
                {user && (
                  <div className="flex space-x-1">
                    <button
                      onClick={handleChatNavigation}
                      className="p-2 rounded-full hover:bg-white/20 relative"
                    >
                      {getChatIcon()}
                      {renderMessageBadge(unreadMessagesCount)}
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-white/20 relative"
                      onClick={toggleNotificationDropdown}
                    >
                      {getNotificationIcon()}
                      {renderNotificationBadge(notificationCount)}
                    </button>
                    
                    {/* Mobile Notification Dropdown */}
                    {isNotificationDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-lg rounded-lg shadow-xl py-2 z-50 border border-white/20">
                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="font-semibold text-gray-800">Notifications</h3>
                          <Link 
                            to={getNotificationPath()}
                            className="text-sm text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setIsNotificationDropdownOpen(false);
                              setNotificationCount(0);
                            }}
                          >
                            View All
                          </Link>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {recentNotifications.length > 0 ? (
                            recentNotifications.map(notification => (
                              <div key={notification.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80">
                                <div className="flex justify-between">
                                  <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                                  <span className="text-xs text-gray-500">
                                    {new Date(notification.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-center text-gray-500">
                              No notifications
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button
                  className="p-2 rounded-full hover:bg-white/20 transition-all"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : user ? (
                    <div className="w-8 h-8 rounded-full bg-blue-100/80 flex items-center justify-center text-blue-600 font-medium border border-white/20">
                      {user.firstName?.charAt(0) || 'U'}
                    </div>
                  ) : (
                    <span className="text-2xl">☰</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white/90 backdrop-blur-lg border-t border-white/20 shadow-inner">
              <div className="px-4 py-3 space-y-1">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm font-medium text-gray-800 border-b border-gray-100">
                      Hello, {user.firstName} {user.lastName}
                    </div>
                    <Link
                      to={user.role === 'admin' ? '/admin/dashboard' : '/profile'}
                      className="flex items-center px-3 py-3 hover:bg-gray-100/80 rounded-lg transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      {user.role === 'admin' ? 'Dashboard' : 'Profile'}
                    </Link>
                    <button
                      onClick={handleLogoutConfirmation}
                      className="flex items-center px-3 py-3 hover:bg-gray-100/80 rounded-lg transition-all w-full text-left"
                    >
                      <LogOut className="w-5 h-5 mr-2 text-red-500" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {mobileMenuSection === 'main' ? (
                      <>
                        <NavLink
                          to="/"
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                          }
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Home
                        </NavLink>
                        <NavLink
                          to="/emergency"
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                          }
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Emergency
                        </NavLink>
                        <NavLink
                          to="/community"
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                          }
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Community
                        </NavLink>
                        <NavLink
                          to="/safety-tips"
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                          }
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Safety Tips
                        </NavLink>
                        <button
                          onClick={() => setMobileMenuSection('getInTouch')}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg"
                        >
                          Get in Touch →
                        </button>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <Link
                            to="/login"
                            className="block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            to="/signup"
                            className="block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setMobileMenuSection('main')}
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg w-full text-left"
                        >
                          ← Back
                        </button>
                        <Link
                          to="/about"
                          className="block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          About
                        </Link>
                        <Link
                          to="/faqs"
                          className="block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          FAQs
                        </Link>
                        <Link
                          to="/contact"
                          className="block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Contact Us
                        </Link>
                        <Link
                          to="/feedback"
                          className="block px-4 py-2 text-sm hover:bg-gray-100/80 rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Feedback
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}

export default Navbar;