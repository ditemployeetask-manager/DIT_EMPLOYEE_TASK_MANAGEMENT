const auditQuery = require("../queries/audit.query");

const createAuditLog = async (auditData) => {
  return await auditQuery.createAuditLog(auditData);
};
const getAllAuditLogs = async () => {
  return await auditQuery.getAllAuditLogs();
};
const getAuditLogById = async (id) => {
  return await auditQuery.getAuditLogById(id);
};
module.exports = {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
};
