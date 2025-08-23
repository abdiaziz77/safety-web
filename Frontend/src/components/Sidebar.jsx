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
  Bell
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

function UserSidebar() {
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
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'My Reports', url: '/dashboard/myreports', icon: FileText },
    { title: 'Reports', url: '/dashboard/reports', icon: FileText },
    { title: 'Active Alerts', url: '/dashboard/alerts', icon: AlertTriangle },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
    { title: 'Messages', url: '/dashboard/notification', icon: Bell },
    { title: 'Live Chat', url: '/dashboard/chat', icon: MessageCircle },
    { title: 'Help', url: '/dashboard/help', icon: HelpCircle },
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

      {/* Sidebar */}
      <div
        className={`${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen fixed top-0 left-0 z-30 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
      {/* Header inside sidebar */}
<div className="flex items-center justify-between p-4 pt-30">
  {!isCollapsed && (
    <h2 className="text-lg font-semibold text-gray-800">Citizen Portal</h2>
  )}
  <button
    onClick={() => setIsCollapsed(!isCollapsed)}
    className="h-8 w-8 p-1 rounded hover:bg-gray-100 hidden md:block"
  >
    <Menu className="h-4 w-4 text-gray-600" />
  </button>
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

        {/* Role Section */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">Role</p>
              <p className="text-xs capitalize text-green-600">
                {user?.role}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 text-xs text-gray-400 text-center border-t border-gray-200">
          © {new Date().getFullYear()} Citizen Portal
        </div>
      </div>
    </>
  );
}

export default UserSidebar;
