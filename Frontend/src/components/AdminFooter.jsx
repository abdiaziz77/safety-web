// src/components/AdminFooter.jsx
import React from 'react';

function AdminFooter({ className = '' }) {
  return (
    <footer className={`bg-white text-grey-800 border-t border-gray-400 p-4 transition-all duration-300 ${className}`}>
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default AdminFooter;