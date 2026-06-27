const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { idParamSchema } = require("../validations/user.validation");
const { createNotificationSchema } = require("../validations/notification.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles(1, 2),
  validate(createNotificationSchema),
  notificationController.createNotification,
);
router.get(
  "/",
  verifyToken,
  authorizeRoles(1, 2, 3),
  notificationController.getMyNotifications,
);
router.patch(
  "/read-all",
  verifyToken,
  authorizeRoles(1, 2, 3),
  notificationController.markAllAsRead,
);
router.patch(
  "/:id/read",
  verifyToken,
  authorizeRoles(1, 2, 3),
  validate(idParamSchema, "params"),
  notificationController.markAsRead,
);
router.get(
  "/unread-count",
  verifyToken,
  authorizeRoles(1, 2, 3),
  notificationController.getUnreadCount,
);
module.exports = router;
