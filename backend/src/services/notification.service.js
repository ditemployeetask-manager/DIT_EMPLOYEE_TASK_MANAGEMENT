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
const markAllAsRead = async (userId) => {
  return await notificationQuery.markAllAsRead(userId);
};
module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  getUnreadCount,
  markAllAsRead,
};
