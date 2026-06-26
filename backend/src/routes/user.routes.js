const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
  "/employees",
  verifyToken,
  authorizeRoles(1),
  userController.createEmployee,
);
router.get(
  "/employees",
  verifyToken,
  authorizeRoles(1, 2),
  userController.getAllEmployees,
);
router.get(
  "/employees/:id",
  verifyToken,
  authorizeRoles(1, 2),
  userController.getEmployeeById,
);

router.put(
  "/employees/:id",
  verifyToken,
  authorizeRoles(1),
  userController.updateEmployee,
);
router.post(
  "/admins",
  verifyToken,
  authorizeRoles(1),
  userController.createAdmin,
);
router.put(
  "/admins/:id/group",
  verifyToken,
  authorizeRoles(1),
  userController.assignAdminGroup,
);
router.get(
  "/admins",
  verifyToken,
  authorizeRoles(1),
  userController.getAllAdmins,
);
router.get(
  "/admins/:id",
  verifyToken,
  authorizeRoles(1),
  userController.getAdminById,
);
router.put(
  "/admins/:id",
  verifyToken,
  authorizeRoles(1),
  userController.updateAdmin,
);
router.patch(
  "/admins/:id/status",
  verifyToken,
  authorizeRoles(1),
  userController.updateAdminStatus,
);
router.put(
  "/:id/reset-password",
  verifyToken,
  authorizeRoles(1),
  userController.resetPassword,
);
module.exports = router;
