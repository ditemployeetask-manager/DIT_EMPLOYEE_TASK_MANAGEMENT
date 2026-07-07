const reportService = require("../services/report.service");

const createReport = async (req, res) => {
  try {
    // Build attachment metadata from uploaded files
    const attachments = (req.files || []).map((f) => ({
      originalName: f.originalname,
      filename: f.filename,
      size: f.size,
      mimetype: f.mimetype,
      url: `/uploads/${f.filename}`,
    }));

    const report = await reportService.createReport(
      req.user.userId,
      { ...req.body, attachments },
      req.user.userId,
    );

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getMyReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const reportDate = req.query.reportDate || null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    const result = await reportService.getMyReports(
      req.user.userId,
      page,
      limit,
      status,
      reportDate,
      startDate,
      endDate,
    );

    res.status(200).json({
      success: true,
      page,
      limit,
      totalRecords: result.total,
      totalPages: Math.ceil(result.total / limit),
      data: result.reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getTeamReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const reportDate = req.query.reportDate || null;

    const result = await reportService.getTeamReports(
      req.user.userId,
      page,
      limit,
      search,
      status,
      reportDate,
    );

    res.status(200).json({
      success: true,
      page,
      limit,
      totalRecords: result.total,
      totalPages: Math.ceil(result.total / limit),
      data: result.reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const reviewReport = async (req, res) => {
  try {
  const report = await reportService.reviewReport(
    req.params.id,
    req.body,
    req.user.userId,
  );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const updateReport = async (req, res) => {
  try {
    // Parse any newly uploaded files
    const newFiles = (req.files || []).map((f) => ({
      originalName: f.originalname,
      filename: f.filename,
      size: f.size,
      mimetype: f.mimetype,
      url: `/uploads/${f.filename}`,
    }));

    // Merge with any existing attachments sent in body (as JSON string)
    let existingAttachments = [];
    if (req.body.existingAttachments) {
      try {
        existingAttachments = JSON.parse(req.body.existingAttachments);
      } catch (_) {}
    }
    const attachments = [...existingAttachments, ...newFiles];

    const report = await reportService.updateReport(
      req.params.id,
      req.user.userId,
      { ...req.body, attachments },
      req.user.userId,
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const exportAllReports = async (req, res) => {
  try {
    const filters = {
      groupId: req.query.groupId ? parseInt(req.query.groupId) : null,
      userId: req.query.userId ? parseInt(req.query.userId) : null,
      roleId: req.query.roleId ? parseInt(req.query.roleId) : null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const workbook = await reportService.exportAllReports(filters);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader("Content-Disposition", 'attachment; filename="reports.xlsx"');

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(
      req.params.id,
      req.user.userId,
      req.user.roleId
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(error.message === "Unauthorized" ? 403 : 404).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await reportService.deleteReport(
      req.params.id,
      req.user.userId,
      req.user.roleId
    );

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
      data: report,
    });
  } catch (error) {
    res.status(error.message === "Unauthorized" ? 403 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getTeamReports,
  reviewReport,
  updateReport,
  exportAllReports,
  getReportById,
  deleteReport,
};