const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
  idParamSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  createAdminSchema,
  updateAdminSchema,
  assignAdminGroupSchema,
  updateAdminStatusSchema,
  paginationSchema,
} = require("../validations/user.validation");

router.post(
  "/employees",
  verifyToken,
  authorizeRoles(1),
  validate(createEmployeeSchema),
  userController.createEmployee,
);
router.get(
  "/employees",
  verifyToken,
  authorizeRoles(1, 2),
  validate(paginationSchema, "query"),
  userController.getAllEmployees,
);
router.get(
  "/employees/:id",
  verifyToken,
  authorizeRoles(1, 2),
  validate(idParamSchema, "params"),
  userController.getEmployeeById,
);

router.put(
  "/employees/:id",
  verifyToken,
  authorizeRoles(1),
  validate(idParamSchema, "params"),
  validate(updateEmployeeSchema),
  userController.updateEmployee,
);
router.post(
  "/admins",
  verifyToken,
  authorizeRoles(1),
  validate(createAdminSchema),
  userController.createAdmin,
);
router.put(
  "/admins/:id/group",
  verifyToken,
  authorizeRoles(1),
  validate(idParamSchema, "params"),
  validate(assignAdminGroupSchema),
  userController.assignAdminGroup,
);
router.get(
  "/admins",
  verifyToken,
  authorizeRoles(1),
  validate(paginationSchema, "query"),
  userController.getAllAdmins,
);
router.get(
  "/admins/:id",
  verifyToken,
  authorizeRoles(1),
  validate(idParamSchema, "params"),
  userController.getAdminById,
);
router.put(
  "/admins/:id",
  verifyToken,
  authorizeRoles(1),
  validate(idParamSchema, "params"),
  validate(updateAdminSchema),
  userController.updateAdmin,
);
router.patch(
  "/admins/:id/status",
  verifyToken,
  authorizeRoles(1),
  validate(idParamSchema, "params"),
  validate(updateAdminStatusSchema),
  userController.updateAdminStatus,
);
router.put(
  "/:id/reset-password",
  verifyToken,
  authorizeRoles(1),
  validate(idParamSchema, "params"),
  userController.resetPassword,
);
module.exports = router;
