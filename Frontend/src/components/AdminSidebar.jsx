// src/components/AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  AlertTriangle,
  Settings,
  Users,
  Home,
  Menu,
  ChevronLeft,
  MessageCircle,
  Bell,
  MessageSquare,
  Mail,
  ChevronDown,
  ChevronRight,
  ChevronRightIcon,
  ChevronLeftIcon,
  X,
  User,
  CreditCard,
  Calendar,
  LifeBuoy,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

import profilePic from '../assets/image/pic.png';

function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  const isActive = (path) => currentPath === path;
  
  const getNavClass = (path) =>
    `flex items-center px-3 py-3 rounded-lg transition-colors mb-2 ${
      isActive(path)
        ? 'bg-blue-500 text-white font-medium border-l-4 border-blue-700'
        : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
    }`;

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.admin-sidebar');
      const toggleButton = document.querySelector('.mobile-toggle-button');
      
      if (isMobileOpen && sidebar && !sidebar.contains(event.target) && 
          toggleButton && !toggleButton.contains(event.target)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen]);

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
        className="mobile-toggle-button md:hidden fixed top-16 left-4 z-50 bg-blue-700 p-2 rounded-md shadow-lg border border-gray-300 text-white"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`admin-sidebar ${
          isMobileOpen ? 'w-64' : isCollapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-gray-300 transition-all duration-300 flex flex-col fixed top-0 left-0 z-40 h-full ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
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
                <DefaultAvatar />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-600">{user?.email || 'admin@example.com'}</p>
                </div>
              </div>
              
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
            <nav className="space-y-2">
              {/* Dashboard */}
              <NavLink
                to="/admin/dashboard"
                className={getNavClass('/admin/dashboard')}
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

              {/* All Reports (no dropdown) */}
              <NavLink
                to="/admin/dashboard/reports"
                className={getNavClass('/admin/dashboard/reports')}
                onClick={() => setIsMobileOpen(false)}
              >
                <FileText className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    All Reports
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  All Reports
                </span>
              </NavLink>

              {/* Report Analytics */}
              <NavLink
                to="/admin/dashboard/report-analytics"
                className={getNavClass('/admin/dashboard/report-analytics')}
                onClick={() => setIsMobileOpen(false)}
              >
                <BarChart3 className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    Report Analytics
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  Report Analytics
                </span>
              </NavLink>

              {/* Alerts */}
              <NavLink
                to="/admin/dashboard/alerts"
                className={getNavClass('/admin/dashboard/alerts')}
                onClick={() => setIsMobileOpen(false)}
              >
                <AlertTriangle className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    Manage Alerts
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  Manage Alerts
                </span>
              </NavLink>

              {/* User Management */}
              <NavLink
                to="/admin/dashboard/usermanagement"
                className={getNavClass('/admin/dashboard/usermanagement')}
                onClick={() => setIsMobileOpen(false)}
              >
                <Users className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    User Management
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  User Management
                </span>
              </NavLink>

              {/* Analytics */}
              <NavLink
                to="/admin/dashboard/analytics"
                className={getNavClass('/admin/dashboard/analytics')}
                onClick={() => setIsMobileOpen(false)}
              >
                <MessageSquare className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    Analytics
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  Analytics
                </span>
              </NavLink>

              {/* Messages */}
              <NavLink
                to="/admin/dashboard/messages"
                className={getNavClass('/admin/dashboard/messages')}
                onClick={() => setIsMobileOpen(false)}
              >
                <Mail className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate hidden md:inline">
                    Messages
                  </span>
                )}
                <span className="ml-3 truncate md:hidden">
                  Messages
                </span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;