const express = require("express");
const router = express.Router();

const auditController = require("../controllers/audit.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { idParamSchema } = require("../validations/user.validation");
const { createAuditLogSchema } = require("../validations/audit.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles(1),
  validate(createAuditLogSchema),
  auditController.createAuditLog,
);
router.get(
  "/",
  verifyToken,
  authorizeRoles(1),
  auditController.getAllAuditLogs,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles(1),
  validate(idParamSchema, "params"),
  auditController.getAuditLogById,
);
module.exports = router;
