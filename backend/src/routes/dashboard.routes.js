const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");

const verifyToken = require("../middleware/auth.middleware");

const authorizeRoles = require("../middleware/role.middleware");

router.get(
  "/employee",
  verifyToken,
  authorizeRoles(3),
  dashboardController.getEmployeeDashboard,
);
router.get(
  "/admin",
  verifyToken,
  authorizeRoles(2),
  dashboardController.getAdminDashboard,
);
router.get(
  "/super-admin",
  verifyToken,
  authorizeRoles(1),
  dashboardController.getSuperAdminDashboard,
);

module.exports = router;
