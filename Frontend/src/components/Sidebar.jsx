// src/components/UserSidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FileText, 
  AlertTriangle, 
  Settings, 
  HelpCircle, 
  Home, 
  Menu, 
  ChevronLeft, 
  MessageCircle, 
  Bell,
  CreditCard,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  LifeBuoy,
  ChevronRightIcon,
  ChevronLeftIcon
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';


import profilePic from '../assets/image/pic.png';

function UserSidebar({ isCollapsed, setIsCollapsed }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(false); 
      } else {
        setIsCollapsed(true); 
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed]);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  const isActive = (path) => currentPath === path;
  
  const getNavClass = (path) =>
    `flex items-center px-3 py-2 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-blue-500 text-white font-medium'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const getDropdownItemClass = (path) =>
    `flex items-center pl-9 pr-3 py-2 rounded-lg transition-colors text-sm ${
      isActive(path)
        ? 'bg-blue-500 text-white font-medium'
        : 'text-gray-700 hover:bg-gray-100' 
    }`;

  
  const DefaultAvatar = () => (
    <img 
      src={profilePic} 
      alt="Profile" 
      className="rounded-full h-10 w-10 object-cover"
    />
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-16 left-4 z-50 bg-blue-700 p-2 rounded-md shadow-lg border border-gray-300 text-white" 
      >
        {isMobileOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

     
      <div
        className={`${
          isMobileOpen ? 'w-64' : isCollapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-gray-300 transition-all duration-300 flex flex-col fixed top-0 left-0 z-40 h-full ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`} 
      >
 
        <div className="px-4 py-4 border-b border-gray-300 bg-white flex items-center justify-between"> 
          {isCollapsed ? (
           
            <button
              onClick={() => setIsCollapsed(false)}
              className="h-10 w-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full" 
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          ) : (
            
            <>
              <div className="flex items-center">
                {/* Show profile picture from assets */}
                <DefaultAvatar />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900"> 
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.name || 'User Name'
                    }
                  </p>
                  <p className="text-xs text-gray-600">{user?.email || 'user@example.com'}</p> 
                </div>
              </div>
              
              {/* Toggle button near profile */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="h-8 w-8 p-1 rounded hover:bg-gray-100 flex items-center justify-center text-gray-700" 
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-2">
            <nav className="space-y-4">
              {/* Dashboard */}
              <NavLink
                to="/dashboard"
                className={getNavClass('/dashboard')}
                onClick={() => setIsMobileOpen(false)}
              >
                <Home className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    Dashboard
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  Dashboard
                </span>
              </NavLink>

              {/* 101 Menu Section Header */}
              {!isCollapsed && (
                <div className="px-3 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider"> 
                    101 Menu
                  </p>
                </div>
              )}

              {/* Reports Dropdown */}
              <div>
                <button
                  onClick={() => toggleDropdown('reports')}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" 
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 min-w-[20px]" />
                    {!isCollapsed && (
                      <span className="ml-3 truncate hidden md:inline">
                        Reports
                      </span>
                    )}
                    <span className="ml-3 truncate md:hidden">
                      Reports
                    </span>
                  </div>
                  {!isCollapsed && (
                    <span className="hidden md:inline">
                      {openDropdowns.reports ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </button>

                {openDropdowns.reports && !isCollapsed && (
                  <div className="ml-2 mt-1 space-y-1">
                    <NavLink
                      to="/dashboard/myreports"
                      className={getDropdownItemClass('/dashboard/myreports')}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <FileText className="h-4 w-4 min-w-[16px]" />
                      <span className="ml-3 truncate">My Reports</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/reports"
                      className={getDropdownItemClass('/dashboard/reports')}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <FileText className="h-4 w-4 min-w-[16px]" />
                      <span className="ml-3 truncate">Reports Form</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Active Alerts */}
              <NavLink
                to="/dashboard/alerts"
                className={getNavClass('/dashboard/alerts')}
                onClick={() => setIsMobileOpen(false)}
              >
                <AlertTriangle className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    Active Alerts
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  Active Alerts
                </span>
              </NavLink>

              {/* Common Section Header */}
              {!isCollapsed && (
                <div className="px-3 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Common
                  </p>
                </div>
              )}

              {/* My Account Dropdown */}
              <div>
                <button
                  onClick={() => toggleDropdown('myAccount')}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" 
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 min-w-[20px]" />
                    {!isCollapsed && (
                      <span className="ml-3 truncate hidden md:inline">
                        My Account
                      </span>
                    )}
                    <span className="ml-3 truncate md:hidden">
                      My Account
                    </span>
                  </div>
                  {!isCollapsed && (
                    <span className="hidden md:inline">
                      {openDropdowns.myAccount ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </button>

                {openDropdowns.myAccount && !isCollapsed && (
                  <div className="ml-2 mt-1 space-y-1">
                    <NavLink
                      to="/dashboard/settings"
                      className={getDropdownItemClass('/dashboard/settings')}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <CreditCard className="h-4 w-4 min-w-[16px]" />
                      <span className="ml-3 truncate">My Profile</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/calendar"
                      className={getDropdownItemClass('/dashboard/calendar')}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Calendar className="h-4 w-4 min-w-[16px]" />
                      <span className="ml-3 truncate">Calendar</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/notification"
                      className={getDropdownItemClass('/dashboard/notification')}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Bell className="h-4 w-4 min-w-[16px]" />
                      <span className="ml-3 truncate">Notification</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Messages */}
              <NavLink
                to="/dashboard/messages"
                className={getNavClass('/dashboard/messages')}
                onClick={() => setIsMobileOpen(false)}
              >
                <MessageCircle className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    Messages
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  Messages
                </span>
              </NavLink>

              {/* Help Desk Section Header */}
              {!isCollapsed && (
                <div className="px-3 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider"> 
                    Help Desk
                    </p>
                </div>
              )}

              {/* Contact Us */}
              <NavLink
                to="/dashboard/chat"
                className={getNavClass('/dashboard/chat')}
                onClick={() => setIsMobileOpen(false)}
              >
                <HelpCircle className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    Contact Us
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                    Contact Us
                </span>
              </NavLink>

              <NavLink
                to="/dashboard/help"
                className={getNavClass('/dashboard/help')}
                onClick={() => setIsMobileOpen(false)}
              >
                <LifeBuoy className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    Get Help
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  Get Help
                </span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserSidebar;