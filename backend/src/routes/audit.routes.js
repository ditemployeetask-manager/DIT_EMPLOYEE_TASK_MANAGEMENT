const express = require("express");
const router = express.Router();

const auditController = require("../controllers/audit.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
  "/",
  verifyToken,
  authorizeRoles(1),
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
  auditController.getAuditLogById,
);
module.exports = router;
