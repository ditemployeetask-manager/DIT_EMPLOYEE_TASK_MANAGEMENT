const reportQuery = require("../queries/report.query");

const createReport = async (userId, reportData) => {
  const reportDate = new Date(reportData.reportDate);

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  reportDate.setHours(0, 0, 0, 0);

  if (reportDate > today) {
    throw new Error("Future reports are not allowed");
  }

  return await reportQuery.createReport({
    userId,
    workDone: reportData.workDone,
    tomorrowPlan: reportData.tomorrowPlan,
    reportDate: reportData.reportDate,
  });
};
const getMyReports = async (userId) => {
  return await reportQuery.getMyReports(userId);
};
const getTeamReports = async () => {
  return await reportQuery.getTeamReports();
};
const reviewReport = async (reportId, reviewData) => {
  const allowedStatus = ["APPROVED", "REJECTED"];

  if (!allowedStatus.includes(reviewData.status)) {
    throw new Error("Invalid Status");
  }

  return await reportQuery.reviewReport(
    reportId,
    reviewData.status,
    reviewData.adminRemarks,
  );
};
const updateReport = async (reportId, userId, reportData) => {
  const report = await reportQuery.getReportById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  if (report.status === "APPROVED") {
    throw new Error("Approved reports cannot be edited");
  }

  return await reportQuery.updateReport(
    reportId,
    reportData.workDone,
    reportData.tomorrowPlan,
  );
};

module.exports = {
  createReport,
  getMyReports,
  getTeamReports,
  reviewReport,
  updateReport,
};
