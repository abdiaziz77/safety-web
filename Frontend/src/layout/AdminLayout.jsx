import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  const [isCollapsed] = useState(false); // can be linked to AdminSidebar toggle

  return (
   <div className="flex min-h-screen overflow-x-hidden">
      {/* Sidebar */}
      <AdminSidebar />

       {/* Main Content */}
           <main
             className={`bg-gray-50 flex-grow transition-all duration-300 min-h-screen overflow-x-hidden ${
               isCollapsed ? "ml-16" : "ml-64"
             }`}
             style={{
               padding: "1.5rem", // space around content
             }}
           >
             <Outlet />
           </main>
         </div>
       );
     };
     

export default AdminLayout;
