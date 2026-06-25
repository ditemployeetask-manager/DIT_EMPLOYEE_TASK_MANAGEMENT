const notificationService = require("../services/notification.service");

const createNotification = async (userId, title, message) => {
  try {
    await notificationService.createNotification({
      userId,
      title,
      message,
    });
  } catch (error) {
    console.error("Notification Error:", error.message);
  }
};

module.exports = createNotification;
