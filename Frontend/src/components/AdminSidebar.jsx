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
  Bell
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
     { title: 'Messages', url: '/admin/dashboard/notification', icon: Bell },
    { title: 'Settings', url: '/admin/dashboard/settings', icon: Settings },
    { title: 'Chats', url: '/admin/dashboard/chats', icon: MessageCircle },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed bottom-4 right-4 z-40 bg-white p-3 rounded-full shadow-lg border border-gray-200"
      >
        {isMobileOpen ? <ChevronLeft className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Fixed Sidebar */}
      <div
        className={`
          ${isCollapsed ? 'w-16' : 'w-64'}
          bg-white border-r border-gray-200
          transition-all duration-300 flex flex-col
          fixed top-16 left-0 h-[calc(100vh-4rem)]
          z-30
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 pt-14">
          <div className="flex items-center justify-between">
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
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={getNavClass(item.url)}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && <span className="ml-3 truncate">{item.title}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Role box */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">Role</p>
              <p className="text-xs capitalize text-blue-600">
                {user?.role}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 text-xs text-gray-400 text-center border-t border-gray-200">
          © {new Date().getFullYear()} Admin Portal
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;
