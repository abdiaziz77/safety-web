// src/layout/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminFooter from '../components/AdminFooter';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main content area with footer */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Main content */}
        <main className="p-4 mt-16 flex-1" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
        
        {/* Footer - now inside the main content area */}
        <AdminFooter />
      </div>
    </div>
  );
}

export default AdminLayout;