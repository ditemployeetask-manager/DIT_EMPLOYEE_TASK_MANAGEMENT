import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Force password change if required - Redirect to role-specific change-password route
  if (user?.must_change_password && !location.pathname.endsWith("/change-password")) {
    if (user?.role_id === 1) return <Navigate to="/superadmin/change-password" replace />;
    if (user?.role_id === 2) return <Navigate to="/admin/change-password" replace />;
    if (user?.role_id === 3) return <Navigate to="/employee/change-password" replace />;
  }

  // Role validation if specified
  if (allowedRoles && !allowedRoles.includes(user?.role_id)) {
    // Redirect unauthorized users to their default dashboard based on their role
    if (user?.role_id === 1) {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else if (user?.role_id === 2) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role_id === 3) {
      return <Navigate to="/employee/dashboard" replace />;
    }
    // Fallback if role is unrecognized
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
