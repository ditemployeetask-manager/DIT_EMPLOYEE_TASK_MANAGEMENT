const notificationQuery = require("../queries/notification.query");

const createNotification = async (notificationData) => {
  return await notificationQuery.createNotification(notificationData);
};
const getMyNotifications = async (userId) => {
  return await notificationQuery.getMyNotifications(userId);
};
const markAsRead = async (id) => {
  return await notificationQuery.markAsRead(id);
};
const getUnreadCount = async (userId) => {
  return await notificationQuery.getUnreadCount(userId);
};
module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  getUnreadCount,
};
