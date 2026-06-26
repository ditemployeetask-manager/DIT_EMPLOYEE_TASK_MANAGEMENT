const ExcelJS = require("exceljs");

const exportReports = async (reports) => {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Reports");

  worksheet.columns = [
    { header: "Employee ID", key: "employee_id", width: 18 },
    { header: "Employee Name", key: "name", width: 25 },
    { header: "Group", key: "group_name", width: 20 },
    { header: "Report Date", key: "report_date", width: 18 },
    { header: "Work Done", key: "work_done", width: 45 },
    { header: "Tomorrow Plan", key: "tomorrow_plan", width: 45 },
    { header: "Status", key: "status", width: 18 },
    { header: "Reviewed By", key: "reviewed_by", width: 25 },
    { header: "Remarks", key: "admin_remarks", width: 35 },
  ];

  reports.forEach((report) => {
    worksheet.addRow(report);
  });

  return workbook;
};

module.exports = {
  exportReports,
};
