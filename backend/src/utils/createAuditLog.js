const auditService = require("../services/audit.service");

const createAuditLog = async (
  userId,
  action,
  entityType,
  entityId,
  description,
) => {
  try {
    await auditService.createAuditLog({
      userId,
      action,
      entityType,
      entityId,
      description,
    });
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = createAuditLog;
