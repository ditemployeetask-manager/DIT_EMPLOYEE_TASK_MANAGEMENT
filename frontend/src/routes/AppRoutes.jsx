import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Layouts
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import AdminLayout from "../layouts/AdminLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";

// Public Pages
import Login from "../pages/auth/Login";
import ChangePassword from "../pages/auth/ChangePassword";

// Shared Pages
import NotificationDetail from "../pages/shared/NotificationDetail";
import ReportDetail from "../pages/shared/ReportDetail";

// Super Admin Pages
import SuperAdminDashboard from "../pages/superadmin/Dashboard";
import SuperAdminEmployees from "../pages/superadmin/Employees";
import SuperAdminEmployeeDetail from "../pages/superadmin/EmployeeDetail";
import SuperAdminAdmins from "../pages/superadmin/Admins";
import SuperAdminAdminDetail from "../pages/superadmin/AdminDetail";
import SuperAdminGroups from "../pages/superadmin/Group";
import SuperAdminAuditLogs from "../pages/superadmin/AuditLogs";
import SuperAdminNotifications from "../pages/superadmin/Notification";
import SuperAdminSendNotification from "../pages/superadmin/SendNotification";
import SuperAdminReports from "../pages/superadmin/Reports";
import SuperAdminExportReports from "../pages/superadmin/ExportReports";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminReviewReports from "../pages/admin/ReviewReports";
import AdminEmployees from "../pages/admin/Employees";
import AdminGroup from "../pages/admin/Group";
import AdminAnalytics from "../pages/admin/Analytics";
import AdminProfile from "../pages/admin/Profile";
import AdminNotification from "../pages/admin/Notification";

// Employee Pages
import EmployeeDashboard from "../pages/employee/Dashboard";
import EmployeeMyReports from "../pages/employee/MyReports";
import EmployeeSubmitReport from "../pages/employee/SubmitReport";
import EmployeeNotification from "../pages/employee/Notification";
import EmployeeProfile from "../pages/employee/Profile";

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultDashboardPath(user?.role_id)} replace />} 
        />

        {/* Super Admin Layout & Pages (Role 1) */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="employees" element={<SuperAdminEmployees />} />
          <Route path="employees/:id" element={<SuperAdminEmployeeDetail />} />
          <Route path="admins" element={<SuperAdminAdmins />} />
          <Route path="admins/:id" element={<SuperAdminAdminDetail />} />
          <Route path="groups" element={<SuperAdminGroups />} />
          <Route path="audit-logs" element={<SuperAdminAuditLogs />} />

          <Route path="notifications" element={<SuperAdminNotifications />} />
          <Route path="notifications/:id" element={<NotificationDetail />} />
          <Route path="send-notification" element={<SuperAdminSendNotification />} />
          <Route path="analytics" element={<SuperAdminReports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="export" element={<SuperAdminExportReports />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Admin Layout & Pages (Role 2) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="reports" element={<AdminReviewReports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="employees/:id" element={<SuperAdminEmployeeDetail />} />
          <Route path="groups" element={<AdminGroup />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="notifications" element={<AdminNotification />} />
          <Route path="notifications/:id" element={<NotificationDetail />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Employee Layout & Pages (Role 3) */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="reports" element={<EmployeeMyReports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="create-report" element={<EmployeeSubmitReport />} />
          <Route path="notifications" element={<EmployeeNotification />} />
          <Route path="notifications/:id" element={<NotificationDetail />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Fallback routing */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? getDefaultDashboardPath(user?.role_id) : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

const getDefaultDashboardPath = (roleId) => {
  if (roleId === 1) return "/superadmin/dashboard";
  if (roleId === 2) return "/admin/dashboard";
  if (roleId === 3) return "/employee/dashboard";
  return "/login";
};

export default AppRoutes;
