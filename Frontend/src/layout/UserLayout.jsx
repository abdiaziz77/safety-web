// src/layout/UserLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from '../components/Sidebar';
import DashboardFooter from '../components/DashboardFooter';

function UserLayout() {
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
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        {/* Sidebar */}
        <UserSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main content area with footer */}
        <div 
          className={`flex flex-col flex-1 transition-all duration-300 ${
            isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <main className="p-4 mt-16 flex-1">
            <Outlet />
          </main>
          
          {/* Footer - will move with main content */}
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}

export default UserLayout;