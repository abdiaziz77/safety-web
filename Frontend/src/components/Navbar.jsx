import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Bell, User, LogOut, ChevronDown, X, MessageSquare } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { io } from 'socket.io-client';

function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [logoError, setLogoError] = useState(false); // For logo fallback

  // Socket.IO connection
  useEffect(() => {
    if (!user) return;
    const newSocket = io('http://localhost:5000', { withCredentials: true });
    setSocket(newSocket);
    newSocket.on('notification_update', (data) => setNotificationCount(data.count));
    newSocket.on('message_update', (data) => setUnreadMessagesCount(data.count));
    return () => newSocket.disconnect();
  }, [user]);

  // Fetch counts periodically
  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      try {
        const endpoint = user.role === 'admin' ? '/admin' : '';
        const [notifResponse, messagesResponse] = await Promise.all([
          axios.get(`${endpoint}/api/notification/count`, { withCredentials: true }),
          axios.get(`${endpoint}/api/chat/unread-count`, { withCredentials: true }),
        ]);
        setNotificationCount(notifResponse.data.count);
        setUnreadMessagesCount(messagesResponse.data.count);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 300000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return null;

  const navigateTo = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  // Helper functions
  const handleLogoutConfirmation = () => {
    toast.info(
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">Confirm Logout</h3>
        <p className="text-gray-700 mb-4">Are you sure you want to logout?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss();
              handleLogout();
            }}
            className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-white"
          >
            Logout
          </button>
        </div>
      </div>,
      { position: 'top-center', autoClose: false }
    );
  };

  const handleLogout = () => {
    if (socket) socket.disconnect();
    logout();
    navigate('/');
    toast.success('Logged out successfully', { position: 'top-center' });
  };

  const getNotificationIcon = () => <Bell className="w-5 h-5" />;
  const getChatIcon = () => <MessageSquare className="w-5 h-5" />;
  const getNotificationPath = () => (user?.role === 'admin' ? '/admin/dashboard/notification' : '/dashboard/notification');
  const getChatPath = () => (user?.role === 'admin' ? '/admin/dashboard/chat' : '/dashboard/chat');

  return (
    <>
      <ToastContainer position="top-center" />

      {/* Enhanced Glassmorphism Header */}
      <header className="bg-white/5 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10 shadow-sm shadow-blue-100/20">
        {/* Emergency Bar with gradient */}
        <div className="bg-gradient-to-r from-blue-600/95 to-blue-800/95 backdrop-blur-sm text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-10 py-1">
              <div className="flex items-center space-x-4 text-sm font-medium">
                <span>🚨 EMERGENCY: CALL 101</span>
                <span className="hidden md:inline">📞 Non-emergency: 555-SAFE</span>
              </div>
              {!user && (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-sm hover:text-blue-200 font-medium">
                    LOGIN
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded font-medium transition-all"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo with fallback */}
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

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-2">
                {user ? (
                  <>
                    {/* Notification & Chat Icons */}
                    <div className="flex items-center space-x-1 bg-white/10 rounded-full p-1">
                      <Link
                        to={getChatPath()}
                        className="p-2 rounded-full hover:bg-white/20 relative transition-all"
                      >
                        {getChatIcon()}
                        {unreadMessagesCount > 0 && (
                          <span className="absolute top-0 right-0 text-xs rounded-full h-5 w-5 flex items-center justify-center bg-red-500 text-white animate-pulse">
                            {unreadMessagesCount}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={() => navigate(getNotificationPath())}
                        className="p-2 rounded-full hover:bg-white/20 relative"
                      >
                        {getNotificationIcon()}
                        {notificationCount > 0 && (
                          <span className="absolute top-0 right-0 text-xs rounded-full h-5 w-5 flex items-center justify-center bg-orange-500 text-white animate-pulse">
                            {notificationCount}
                          </span>
                        )}
                      </button>
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
                                to="/settings"
                                className="flex items-center px-4 py-3 text-sm hover:bg-gray-100/80"
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
                    <Link
                      to={getChatPath()}
                      className="p-2 rounded-full hover:bg-white/20 relative"
                    >
                      {getChatIcon()}
                      {unreadMessagesCount > 0 && (
                        <span className="absolute top-0 right-0 text-xs rounded-full h-5 w-5 flex items-center justify-center bg-red-500 text-white">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </Link>
                    <button
                      className="p-2 rounded-full hover:bg-white/20 relative"
                      onClick={() => navigate(getNotificationPath())}
                    >
                      {getNotificationIcon()}
                      {notificationCount > 0 && (
                        <span className="absolute top-0 right-0 text-xs rounded-full h-5 w-5 flex items-center justify-center bg-orange-500 text-white">
                          {notificationCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}
                <button
                  className="p-2 rounded-lg hover:bg-white/20 transition-all"
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
                      className="flex items-center px-3 py-3 hover:bg-gray-100/80 rounded-lg transition-all"
                    >
                      <LogOut className="w-5 h-5 mr-2 text-red-500" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
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