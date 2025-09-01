// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../auth/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();

  // While checking auth status
  if (loading) return <div>Loading...</div>;

  // If not logged in, redirect to login page
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If route requires a specific role but user doesn't match → block
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Otherwise allow access
  return <Outlet />;
};

export default ProtectedRoute;
