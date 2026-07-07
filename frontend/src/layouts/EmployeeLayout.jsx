import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import notificationService from "../services/notificationService";
import emblemLogo from "../assets/logos/emblem_of_india.svg";

const EmployeeLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isMandatory = user?.must_change_password;

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000); // Check every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success && res.data) {
        setUnreadCount(parseInt(res.data.unread_count) || 0);
      }
    } catch (err) {
      console.error("Failed to load notification count", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper to get active page title dynamically
  const getPageTitle = (pathname) => {
    if (pathname.endsWith("/dashboard")) return "Employee Dashboard";
    if (pathname.endsWith("/reports")) return "My Reports";
    if (pathname.endsWith("/create-report")) return "Create Report";
    if (pathname.endsWith("/pending-reports")) return "Pending Reports";
    if (pathname.includes("/notifications/")) return "Notification Details";
    if (pathname.endsWith("/notifications")) return "Notifications";
    if (pathname.endsWith("/profile")) return "Profile";
    if (pathname.endsWith("/change-password")) return "Security Settings";
    return "Employee Dashboard";
  };

  const navItems = [
    {
      path: "/employee/dashboard",
      name: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    {
      path: "/employee/reports",
      name: "My Reports",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: "/employee/create-report",
      name: "Create Report",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: "/employee/notifications",
      name: "Notifications",
      badge: unreadCount || null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    {
      path: "/employee/profile",
      name: "Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      path: "/employee/change-password",
      name: "Change Password",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ${collapsed ? "w-20" : "w-64"} flex-shrink-0 relative`}>
        {/* Header Block (Dark Blue Branding with white logo) */}
        <div className="bg-[#06152d] p-4 h-20 flex items-center overflow-hidden transition-all duration-300">
          <img src={emblemLogo} alt="Emblem" className="h-10 w-auto mr-3 flex-shrink-0 object-contain brightness-0 invert" />
          {!collapsed && (
            <div className="flex flex-col text-left text-white leading-normal">
              <span className="text-[10px] font-bold tracking-wide">Government of Tripura</span>
              <span className="text-[8px] font-medium text-slate-300 opacity-90 truncate">Directorate of IT</span>
              <span className="text-[8px] font-medium text-slate-300 opacity-80 truncate">Task Manager System</span>
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-grow overflow-y-auto px-3 py-4 space-y-1 select-none">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={isMandatory ? "/employee/change-password" : item.path}
              onClick={(e) => {
                if (isMandatory && item.path !== "/employee/change-password") {
                  e.preventDefault();
                }
              }}
              className={({ isActive }) =>
                `flex items-center justify-between p-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isMandatory && item.path !== "/employee/change-password" ? "opacity-50 cursor-not-allowed text-slate-400" : ""
                } ${
                  isActive && (!isMandatory || item.path === "/employee/change-password")
                    ? "bg-[#1b3b6f] text-white shadow-md shadow-blue-900/10"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
              title={collapsed ? item.name : undefined}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>
              {!collapsed && item.badge && (
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Sidebar Bottom Banner (No palace outline drawing at the bottom) */}
        <div className="p-3 border-t border-slate-100 bg-white">
          {/* Bottom Card matching mockup */}
          {!collapsed && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-start text-left shadow-sm">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <svg className="w-4 h-4 text-blue-900 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Help & Support</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                Need help? Contact support
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col flex-grow h-screen overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="bg-white border-b border-slate-200 h-20 px-6 flex items-center justify-between select-none">
          {/* Left: Hamburger Toggle & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => !isMandatory && setCollapsed(!collapsed)}
              disabled={isMandatory}
              className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors focus:outline-none ${isMandatory ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-slate-800">{getPageTitle(location.pathname)}</h2>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              disabled={isMandatory}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Right Profile / Bell */}
          <div className="flex items-center gap-4 relative">
            {/* Bell Icon with red badge */}
            <button 
              onClick={() => !isMandatory && navigate("/employee/notifications")}
              disabled={isMandatory}
              className={`p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 relative transition-colors ${isMandatory ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {!isMandatory && unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-white"></span>
              )}
            </button>

            {/* Profile Dropdown Toggler */}
            <div className="relative">
              <button 
                onClick={() => !isMandatory && setShowProfileDropdown(!showProfileDropdown)}
                disabled={isMandatory}
                className={`flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none ${isMandatory ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Initials Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#1b3b6f] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user?.name?.substring(0, 2).toUpperCase() || "EM"}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-normal">
                  <span className="text-xs font-bold text-slate-800">{user?.name || "Employee User"}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{user?.employee_id || "EMP-001"} • IT Department</span>
                </div>
                {!isMandatory && (
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${showProfileDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Profile Dropdown items */}
              {showProfileDropdown && !isMandatory && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-xl shadow-lg py-1.5 z-50 animate-fade-in text-left">
                  <button 
                    onClick={() => { setShowProfileDropdown(false); navigate("/employee/dashboard"); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    My Dashboard
                  </button>
                  <button 
                    onClick={() => { setShowProfileDropdown(false); navigate("/employee/change-password"); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    Change Password
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    Logout Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY OUTLET */}
        <main className="flex-grow overflow-y-auto p-6 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
