// src/layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PublicLayout = () => {
  return (
    <div>
      {/* You can add a public header or nav here if needed */}
      
      <Outlet />
      {/* You can add a footer here if needed */}
    </div>
  );
};

export default PublicLayout;
