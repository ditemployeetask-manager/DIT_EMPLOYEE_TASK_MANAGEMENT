const reportQuery = require("../queries/report.query");
const createNotification = require("../utils/createNotification");
const userQuery = require("../queries/user.query");
const createAuditLog = require("../utils/createAuditLog");
const { exportReports } = require("../exports/report.export");

const formatReportDate = (date) => {
  if (!date) return "";
  if (date instanceof Date) return date.toISOString().split("T")[0];
  return String(date).split("T")[0];
};

const normalizeReportTitle = (reportData = {}) => {
  const title = (reportData.title || "").trim();
  const reportTitle = (reportData.reportTitle || "").trim();

  if (title && title !== "Daily Status Report") return title;
  return reportTitle || title || "Daily Status Report";
};

const normalizeTomorrowPlan = (reportData = {}) => {
  return (reportData.tomorrowPlan ?? reportData.tomorrow_plan ?? "").trim();
};

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
    title: normalizeReportTitle(reportData),
    workDone: reportData.workDone,
    tomorrowPlan: normalizeTomorrowPlan(reportData),
    reportDate: reportData.reportDate,
    attachments: reportData.attachments || [],
  });

  const employee = await userQuery.getUserById(userId);

  const groupIds = Array.isArray(employee.group_ids) ? employee.group_ids : [];
  const adminResults = await Promise.all(
    groupIds.map((groupId) => userQuery.getAdminsByGroup(groupId)),
  );
  const adminsById = new Map();
  adminResults.flat().forEach((admin) => adminsById.set(admin.id, admin));
  const submittedDate = formatReportDate(report.report_date);

  for (const admin of adminsById.values()) {
    await createNotification(
      admin.id,
      "New Report Submitted",
      `${employee.name} submitted a report for ${submittedDate}.`,
    );
  }
  await createAuditLog(
    createdBy,
    "CREATE_REPORT",
    "REPORT",
    report.id,
    `${employee.name} submitted report for ${submittedDate}`,
  );

  return report;
};
const getMyReports = async (userId, page, limit, status, reportDate, startDate, endDate) => {
  return await reportQuery.getMyReports(
    userId,
    page,
    limit,
    status,
    reportDate,
    startDate,
    endDate,
  );
};

const getTeamReports = async (
  userId,
  page,
  limit,
  search,
  status,
  reportDate,
) => {
  const user = await userQuery.getUserById(userId);

  if (user.role_id === 1) {
    return await reportQuery.getAllTeamReports(
      page,
      limit,
      search,
      status,
      reportDate,
    );
  }

  return await reportQuery.getTeamReports(
    user.group_ids,
    page,
    limit,
    search,
    status,
    reportDate,
  );
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
    normalizeReportTitle(reportData),
    reportData.workDone,
    normalizeTomorrowPlan(reportData),
    reportData.attachments || [],
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
const exportAllReports = async (filters) => {
  const reports = await reportQuery.getReportsForExport(filters);

  return await exportReports(reports);
};

const getReportById = async (reportId, userId, roleId) => {
  const report = await reportQuery.getReportById(reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  // Employees can only view their own reports
  if (roleId === 3 && report.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  const employee = await userQuery.getUserById(report.user_id);
  report.employee_name = employee.name;
  report.employee_code = employee.employee_id;

  return report;
};

const deleteReport = async (reportId, userId, roleId) => {
  const report = await reportQuery.getReportById(reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  // Only the owner (role 3) can delete
  if (report.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  if (report.status === "APPROVED") {
    throw new Error("Approved reports cannot be deleted");
  }

  const deletedReport = await reportQuery.deleteReport(reportId);

  await createAuditLog(
    userId,
    "DELETE_REPORT",
    "REPORT",
    reportId,
    `Deleted report ${reportId}`
  );

  return deletedReport;
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
