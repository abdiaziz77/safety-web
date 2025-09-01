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
  Mail
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed]);

  useEffect(() => {
    // Add a slight delay to trigger the animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const isActive = (path) => currentPath === path;
  const getNavClass = (path) =>
    `flex items-center px-3 py-2 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-blue-100 text-blue-600 font-medium border-r-2 border-blue-600'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const navItems = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: Home },
    { title: 'All Reports', url: '/admin/dashboard/reports', icon: FileText },
    { title: 'Manage Alerts', url: '/admin/dashboard/alerts', icon: AlertTriangle },
    { title: 'Analytics', url: '/admin/dashboard/analytics', icon: BarChart3 },
    { title: 'User Management', url: '/admin/dashboard/usermanagement', icon: Users },
    { title: 'Chats', url: '/admin/dashboard/chats', icon: MessageSquare }, 
    { title: 'Message', url: '/admin/dashboard/messages', icon: Mail }, 
  ];

  return (
    <>
      {/* Mobile toggle button - positioned below navbar */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-16 left-4 z-50 bg-white p-2 rounded-md shadow-lg border border-gray-200"
      >
        {isMobileOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isMobileOpen ? 'w-64' : isCollapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-gray-400 transition-all duration-300 flex flex-col h-screen fixed top-0 left-0 z-40 py-5 mt-33 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        } transition-transform transition-opacity duration-500 ease-in-out`}
      >
        {/* Header inside sidebar */}
        <div className="flex items-center justify-between px-4 mb-6">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-1 rounded hover:bg-gray-100 hidden md:block"
          >
            <Menu className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={getNavClass(item.url)}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.title : ''}
              >
                <item.icon className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && (
                  <span className="ml-3 truncate">{item.title}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;