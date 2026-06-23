const dashboardQuery = require("../queries/dashboard.query");

const getEmployeeDashboard = async (userId) => {
  return await dashboardQuery.getEmployeeStats(userId);
};
const getAdminDashboard = async () => {
  return await dashboardQuery.getAdminStats();
};
const getSuperAdminDashboard = async () => {
  return await dashboardQuery.getSuperAdminStats();
};
module.exports = {
  getEmployeeDashboard,
  getAdminDashboard,
  getSuperAdminDashboard,
};
