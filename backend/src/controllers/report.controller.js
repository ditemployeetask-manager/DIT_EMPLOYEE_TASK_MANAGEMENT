const reportService = require("../services/report.service");

const createReport = async (req, res) => {
  try {
    const report = await reportService.createReport(
      req.user.userId,
      req.body,
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

    const result = await reportService.getMyReports(
      req.user.userId,
      page,
      limit,
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
    const report = await reportService.updateReport(
      req.params.id,
      req.user.userId,
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
const exportAllReports = async (req, res) => {
  try {
    const workbook = await reportService.exportAllReports();

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
module.exports = {
  createReport,
  getMyReports,
  getTeamReports,
  reviewReport,
  updateReport,
  exportAllReports,
};