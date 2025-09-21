import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Bell, User, LogOut, ChevronDown, X, MessageSquare, Menu, Search } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper functions
  const getNotificationPath = () => '/dashboard/notification';
  const getChatPath = () => '/dashboard/chat';

  // Fetch counts and recent notifications
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        // Fetch notification count (for all users, including admin)
        const notifResponse = await axios.get('/api/notifications/unread-count', { withCredentials: true });
        setNotificationCount(notifResponse.data.unread_count || 0);

        // Only fetch unread messages count for non-admin users
        if (user.role !== 'admin') {
          const messagesResponse = await axios.get('/api/chat/unread_count', { withCredentials: true });
          setUnreadMessagesCount(messagesResponse.data.total_unread_messages || 0);
        } else {
          setUnreadMessagesCount(0); // Admins don't see message count
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
        setNotificationCount(0);
        setUnreadMessagesCount(0);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch recent notifications when dropdown is opened
  useEffect(() => {
    if (isNotificationDropdownOpen && user) {
      fetchRecentNotifications();
    }
  }, [isNotificationDropdownOpen, user]);

  // Function to fetch recent notifications
  const fetchRecentNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications/recent?limit=5', { withCredentials: true });
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
    
    if (!isNotificationDropdownOpen && notificationCount > 0) {
      try {
        await axios.put('/api/notifications/read-all', {}, { withCredentials: true });
        setNotificationCount(0);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
    
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  // Handle navigation to notifications page
  const handleNotificationNavigation = () => {
    setIsNotificationDropdownOpen(false);
    setNotificationCount(0);
    navigate(getNotificationPath());
  };

  // Handle navigation to chat
  const handleChatNavigation = async () => {
    setUnreadMessagesCount(0);
    navigate(getChatPath());
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  if (loading) return null;

  // Logout functions
  const handleLogoutConfirmation = () => {
    setIsMobileMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    try {
      setShowLogoutModal(false);
      await logout();
      toast.success("Logged out successfully", { position: "top-center" });
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Helper function to render notification badge
  const renderNotificationBadge = (count) => {
    if (count > 0) {
      // For admin, always show the count as a badge
      if (user?.role === 'admin') {
        return (
          <span className="absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center bg-red-500 text-white">
            {count > 99 ? '99+' : count}
          </span>
        );
      }
      // For others, show as usual
      return (
        <span className="absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center bg-red-500 text-white">
          {count > 99 ? '99+' : count}
        </span>
      );
    }
    return null;
  };

  // Helper function to render message badge
  const renderMessageBadge = (count) => {
    // Only show for non-admin users
    if (user?.role !== 'admin' && count > 0) {
      return (
        <span className="absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center bg-red-500 text-white">
          {count > 99 ? '99+' : count}
        </span>
      );
    }
    return null;
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
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Nav with white background */}
      <nav className={`bg-white sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {!user && (
                <>
                  <img 
                    src="/src/assets/image/logo.png" 
                    alt="SafeZone101 Logo" 
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg items-center justify-center text-white font-bold text-lg">
                    SZ
                  </div>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow">
                    SafeZone101
                  </span>
                </>
              )}
            </Link>
            
            {/* Desktop Menu - Center - Only show when user is not logged in */}
            {!user && (
              <div className="hidden md:flex items-center space-x-8 ml-auto">
                <div className="flex-grow"></div>
                {/* Move nav links to the right side */}
                <div className="flex items-center space-x-8">
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => 
                      `font-semibold text-lg transition-colors ${isActive ? 'text-blue-700' : 'text-gray-900 hover:text-blue-700'}`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink 
                    to="/alerts" 
                    className={({ isActive }) => 
                      `font-semibold text-lg transition-colors ${isActive ? 'text-blue-700' : 'text-gray-900 hover:text-blue-700'}`
                    }
                  >
                    Alerts
                  </NavLink>
                  <NavLink 
                    to="/safety-tips" 
                    className={({ isActive }) => 
                      `font-semibold text-lg transition-colors ${isActive ? 'text-blue-700' : 'text-gray-900 hover:text-blue-700'}`
                    }
                  >
                    Safety Tips
                  </NavLink>
                  <NavLink 
                    to="/emergency" 
                    className={({ isActive }) => 
                      `font-semibold text-lg transition-colors ${isActive ? 'text-blue-700' : 'text-gray-900 hover:text-blue-700'}`
                    }
                  >
                    Emergency
                  </NavLink>
                   <NavLink 
                    to="/feedback" 
                    className={({ isActive }) => 
                      `font-semibold text-lg transition-colors ${isActive ? 'text-blue-700' : 'text-gray-900 hover:text-blue-700'}`
                    }
                  >
                    Feedback
                  </NavLink>
                </div>
                {/* Search Bar - Positioned between nav links and login */}
                <div className="relative mx-4">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 text-gray-900 font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>
                {/* Divider */}
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                {/* Login Button - stick to right edge */}
                <Link
                  to="/login"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-md font-bold text-lg transition-colors shadow-md ml-auto"
                  style={{ minWidth: '110px', textAlign: 'center' }}
                >
                  Login
                </Link>
              </div>
            )}
            
            {/* Right side items */}
            <div className="flex items-center space-x-4 ml-auto">
              {/* Search Bar - Only show when user is logged in */}
              {user && (
                <div className="hidden md:block relative">
                  <form onSubmit={handleSearch}>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="px-3 py-2 w-48 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="p-2 bg-gray-100 hover:bg-gray-200 border-l transition-colors"
                      >
                        <Search className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {user ? (
                <>
                  {/* Notification & Chat Icons */}
                  <div className="flex items-center space-x-2">
                    {/* Only show chat icon for non-admin users */}
                    {user.role !== 'admin' && (
                      <button
                        onClick={handleChatNavigation}
                        className="p-2 rounded-full hover:bg-gray-100 relative transition-all group"
                        aria-label="Messages"
                      >
                        <MessageSquare className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        {renderMessageBadge(unreadMessagesCount)}
                      </button>
                    )}

                    {/* Notification Dropdown - Only show for non-admin users */}
                    {user.role !== 'admin' && (
                      <div className="relative">
                        <button
                          onClick={toggleNotificationDropdown}
                          className="p-2 rounded-full hover:bg-gray-100 relative group"
                          aria-label="Notifications"
                        >
                          <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                          {renderNotificationBadge(notificationCount)}
                        </button>

                        {isNotificationDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                              <h3 className="font-semibold text-gray-800">Notifications</h3>
                              <button 
                                onClick={handleNotificationNavigation}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                View All
                              </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                              {recentNotifications.length > 0 ? (
                                recentNotifications.map(notification => (
                                  <div key={notification.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer">
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
                  </div>

                  {/* Blue Logout Button (replaces user dropdown) */}
                  <button
                    onClick={handleLogoutConfirmation}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="hidden md:flex items-center space-x-4">
                    {/* Mobile view already has the login button in the nav links section */}
                  </div>
                </>
              )}
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3">
            {/* Mobile Search - Show for both logged in and logged out users */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="ml-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
            
            {user ? (
              <>
                <button
                  onClick={handleLogoutConfirmation}
                  className="block w-full text-left px-3 py-3 bg-blue-600 text-white rounded-lg transition-all text-center font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/alerts"
                  className={({ isActive }) =>
                    `block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Alerts
                </NavLink>
                <NavLink
                  to="/safety-tips"
                  className={({ isActive }) =>
                    `block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Safety Tips
                </NavLink>
                <NavLink
                  to="/emergency"
                  className={({ isActive }) =>
                    `block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Emergency
                </NavLink>

                 <NavLink
                  to="/feedback"
                  className={({ isActive }) =>
                    `block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Feedback
                </NavLink>
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-center text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    LOGIN
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;