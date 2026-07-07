import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import notificationService from "../../services/notificationService";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the base path from current URL
  const getBasePath = () => {
    if (location.pathname.startsWith("/superadmin")) return "/superadmin";
    if (location.pathname.startsWith("/admin")) return "/admin";
    if (location.pathname.startsWith("/employee")) return "/employee";
    return "";
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      } else {
        setError("Failed to load notifications.");
      }
    } catch (err) {
      setError("An error occurred while loading notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      }
    } catch (err) {
      setError("Failed to clear alerts.");
    }
  };

  const handleOpenNotification = (notif) => {
    navigate(`${getBasePath()}/notifications/${notif.id}`, {
      state: { notification: notif }
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] select-none">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1b3b6f]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-500 animate-pulse">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto select-none text-left py-2 space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Notifications</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            You have <span className="text-[#1b3b6f] font-extrabold">{unreadCount} unread</span> notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-[#1b3b6f] hover:text-[#12284c] bg-blue-50 hover:bg-blue-100/70 border border-blue-100 rounded-xl px-4 py-2 transition-all cursor-pointer"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleOpenNotification(notif)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                notif.is_read ? "hover:bg-slate-50/50" : "bg-blue-50/20 hover:bg-blue-50/30"
              }`}
            >
              {/* Icon */}
              <div className={`p-2.5 rounded-xl flex-shrink-0 border ${
                notif.is_read 
                  ? "bg-slate-50 text-slate-400 border-slate-100" 
                  : "bg-blue-50 text-[#1b3b6f] border-blue-100/60"
              }`}>
                {notif.is_read ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                ) : (
                  <div className="relative">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-900 border border-white"></span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h4 className={`text-sm ${notif.is_read ? "font-bold text-slate-700" : "font-black text-slate-900"}`}>
                    {notif.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                      {new Date(notif.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed break-words whitespace-pre-line line-clamp-2">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl mb-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2a2 2 0 00-2 2v1a2 2 0 00-2 2H8a2 2 0 00-2-2v-1a2 2 0 00-2-2H2" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-800">Inbox is Clear</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1">You do not have any notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
