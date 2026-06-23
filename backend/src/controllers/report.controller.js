const reportService = require("../services/report.service");

const createReport = async (req, res) => {
  try {
    const report = await reportService.createReport(req.user.userId, req.body);

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
    const reports = await reportService.getMyReports(req.user.userId);

    res.status(200).json({
      success: true,
      data: reports,
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
    const reports = await reportService.getTeamReports();

    res.status(200).json({
      success: true,
      data: reports,
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
    const report = await reportService.reviewReport(req.params.id, req.body);

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
module.exports = {
  createReport,
  getMyReports,
  getTeamReports,
  reviewReport,
  updateReport,
};