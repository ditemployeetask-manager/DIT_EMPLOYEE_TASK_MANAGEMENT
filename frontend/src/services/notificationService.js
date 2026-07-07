import api from "../utils/api";

const notificationService = {
  createNotification: async (notificationData) => {
    return await api.post("/notifications", notificationData);
  },

  getMyNotifications: async () => {
    return await api.get("/notifications");
  },

  markAllAsRead: async () => {
    return await api.patch("/notifications/read-all");
  },

  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  },

  getUnreadCount: async () => {
    return await api.get("/notifications/unread-count");
  },
};

export default notificationService;
