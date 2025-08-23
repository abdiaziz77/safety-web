import UserSidebar from '../components/Sidebar';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  const [isCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* Fixed Sidebar */}
      <UserSidebar className="fixed top-16" />

      {/* Main content */}
      <main
        className={`bg-gray-50 flex-grow transition-all duration-300 min-h-screen overflow-x-hidden pt-4 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
