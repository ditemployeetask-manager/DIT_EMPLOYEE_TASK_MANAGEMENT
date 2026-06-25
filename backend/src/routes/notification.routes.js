const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
  "/",
  verifyToken,
  authorizeRoles(1, 2),
  notificationController.createNotification,
);
router.get(
  "/",
  verifyToken,
  authorizeRoles(1, 2, 3),
  notificationController.getMyNotifications,
);
router.patch(
  "/:id/read",
  verifyToken,
  authorizeRoles(1, 2, 3),
  notificationController.markAsRead,
);
router.get(
  "/unread-count",
  verifyToken,
  authorizeRoles(1, 2, 3),
  notificationController.getUnreadCount,
);
module.exports = router;
