import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import notificationService from "../../services/notificationService";

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState(location.state?.notification || null);
  const [loading, setLoading] = useState(!notification);
  const [error, setError] = useState("");

  const getBackPath = () => {
    if (location.pathname.startsWith("/superadmin")) return "/superadmin/notifications";
    if (location.pathname.startsWith("/admin")) return "/admin/notifications";
    if (location.pathname.startsWith("/employee")) return "/employee/notifications";
    return -1;
  };

  useEffect(() => {
    if (!notification) {
      fetchNotification();
    } else if (!notification.is_read) {
      markRead();
    }
  }, []);

  const fetchNotification = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success && res.data) {
        const found = res.data.find(n => n.id === parseInt(id));
        if (found) {
          setNotification(found);
          if (!found.is_read) markRead();
        } else {
          setError("Notification not found.");
        }
      } else {
        setError("Failed to load notification details.");
      }
    } catch (err) {
      setError("An error occurred while loading notification.");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async () => {
    try {
      await notificationService.markAsRead(parseInt(id));
      setNotification(prev => prev ? { ...prev, is_read: true } : prev);
    } catch (err) { /* silent */ }
  };

  const getNotifType = (title) => {
    if (!title) return "General";
    if (title.includes("Report")) return "Report Update";
    if (title.includes("Welcome")) return "Onboarding";
    if (title.includes("Password")) return "Security";
    if (title.includes("Task")) return "Task";
    if (title.includes("Maintenance")) return "System";
    return "General";
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Report Update": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Onboarding": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Security": return "bg-red-50 text-red-700 border-red-200";
      case "Task": return "bg-amber-50 text-amber-700 border-amber-200";
      case "System": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] select-none">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1b3b6f]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-500 animate-pulse">Loading notification...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 select-none text-left space-y-4">
        <button onClick={() => navigate(getBackPath())} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Notifications
        </button>
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-xs font-semibold">{error}</div>
      </div>
    );
  }

  const createdDate = notification ? new Date(notification.created_at) : null;
  const notifType = getNotifType(notification?.title);
  const typeColor = getTypeColor(notifType);

  return (
    <div className="max-w-2xl mx-auto select-none text-left py-2 space-y-5">
      {/* Back Button */}
      <button
        onClick={() => navigate(getBackPath())}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Notifications
      </button>

      {/* Main Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
        {/* Top Row: Title + Badge */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex-grow min-w-0">
            <h2 className="text-xl font-bold text-slate-800 leading-snug">{notification?.title}</h2>
            <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${typeColor}`}>
                {notifType}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                notification?.is_read
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-amber-50 text-amber-600 border-amber-200"
              }`}>
                {notification?.is_read ? "Read" : "Unread"}
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6 border-b border-slate-100">
          {/* Sent By */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1b3b6f] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              SA
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sent By</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5">System Administrator</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Received</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5">
                {createdDate?.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                <span className="text-slate-400 font-semibold ml-1.5">
                  {createdDate?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="py-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message</span>
          <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line mt-3">
            {notification?.message}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold">ID #{notification?.id} • In-App Notification</span>
          <button
            onClick={() => navigate(getBackPath())}
            className="bg-[#1b3b6f] hover:bg-[#12284c] text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Back to Inbox
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
