const dashboardService = require("../services/dashboard.service");

const getEmployeeDashboard = async (req, res) => {
  try {
    const stats = await dashboardService.getEmployeeDashboard(req.user.userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAdminDashboard = async (req, res) => {
  try {
    const stats = await dashboardService.getAdminDashboard();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getSuperAdminDashboard = async (req, res) => {
  try {
    const stats = await dashboardService.getSuperAdminDashboard();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getEmployeeDashboard,
  getAdminDashboard,
  getSuperAdminDashboard,
};
