const notificationService = require("../services/notification.service");

const createNotification = async (req, res) => {
  try {
    const notification = await notificationService.createNotification(req.body);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getMyNotifications(
      req.user.userId,
    );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.userId);

    res.status(200).json({
      success: true,
      data: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  getUnreadCount,
};
