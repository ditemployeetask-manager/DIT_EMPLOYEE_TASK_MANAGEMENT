const auditService = require("../services/audit.service");

const createAuditLog = async (req, res) => {
  try {
    const audit = await auditService.createAuditLog(req.body);

    res.status(201).json({
      success: true,
      data: audit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllAuditLogs = async (req, res) => {
  try {
    const logs = await auditService.getAllAuditLogs();

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAuditLogById = async (req, res) => {
  try {
    const log = await auditService.getAuditLogById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
};
