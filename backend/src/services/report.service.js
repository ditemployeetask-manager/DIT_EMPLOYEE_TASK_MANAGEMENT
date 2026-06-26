const reportQuery = require("../queries/report.query");
const createNotification = require("../utils/createNotification");
const userQuery = require("../queries/user.query");
const createAuditLog = require("../utils/createAuditLog");
const { exportReports } = require("../exports/report.export");

const createReport = async (userId, reportData, createdBy) => {
  const reportDate = new Date(reportData.reportDate);

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  reportDate.setHours(0, 0, 0, 0);

  if (reportDate > today) {
    throw new Error("Future reports are not allowed");
  }

  const report = await reportQuery.createReport({
    userId,
    workDone: reportData.workDone,
    tomorrowPlan: reportData.tomorrowPlan,
    reportDate: reportData.reportDate,
  });

  const employee = await userQuery.getUserById(userId);

  const admins = await userQuery.getAdminsByGroup(employee.group_id);

  for (const admin of admins) {
    await createNotification(
      admin.id,
      "New Report Submitted",
      `${employee.name} submitted a report for ${report.report_date.toISOString().split("T")[0]}.`,
    );
  }
  await createAuditLog(
    createdBy,
    "CREATE_REPORT",
    "REPORT",
    report.id,
    `${employee.name} submitted report for ${
      report.report_date.toISOString().split("T")[0]
    }`,
  );

  return report;
};
const getMyReports = async (userId) => {
  return await reportQuery.getMyReports(userId);
};

const getTeamReports = async (userId) => {
  const user = await userQuery.getUserById(userId);

  if (user.role_id === 1) {
    return await reportQuery.getAllTeamReports();
  }

  return await reportQuery.getTeamReports(user.group_id);
};
const reviewReport = async (reportId, reviewData, reviewedBy) => {
  const allowedStatus = ["APPROVED", "REJECTED"];

  if (!allowedStatus.includes(reviewData.status)) {
    throw new Error("Invalid Status");
  }

 const report = await reportQuery.reviewReport(
   reportId,
   reviewData.status,
   reviewData.adminRemarks,
   reviewedBy,
 );

  const employee = await userQuery.getUserById(report.user_id);

  if (reviewData.status === "APPROVED") {
    await createNotification(
      employee.id,
      "Report Approved",
      `Your report for ${
        report.report_date.toISOString().split("T")[0]
      } has been approved.`,
    );
  } else {
    await createNotification(
      employee.id,
      "Report Rejected",
      `Your report has been rejected.\n\nRemarks: ${reviewData.adminRemarks}`,
    );
  }
  await createAuditLog(
    reviewedBy,
    reviewData.status === "APPROVED" ? "APPROVE_REPORT" : "REJECT_REPORT",
    "REPORT",
    report.id,
    reviewData.status === "APPROVED"
      ? `Approved report ${report.id}`
      : `Rejected report ${report.id}`,
  );

  return report;
};
const updateReport = async (reportId, userId, reportData, updatedBy) => {
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

  const updatedReport = await reportQuery.updateReport(
    reportId,
    reportData.workDone,
    reportData.tomorrowPlan,
  );
  await createAuditLog(
    updatedBy,
    "UPDATE_REPORT",
    "REPORT",
    updatedReport.id,
    `Updated report ${updatedReport.id}`,
  );
  return updatedReport;
};
const exportAllReports = async () => {
  const reports = await reportQuery.getReportsForExport();

  return await exportReports(reports);
};
module.exports = {
  createReport,
  getMyReports,
  getTeamReports,
  reviewReport,
  updateReport,
  exportAllReports,
};
