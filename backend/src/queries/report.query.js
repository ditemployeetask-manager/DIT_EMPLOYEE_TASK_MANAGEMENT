const pool = require("../config/db");

const createReport = async (data) => {
  const result = await pool.query(
    `
    INSERT INTO reports
    (
      user_id,
      work_done,
      tomorrow_plan,
      report_date
    )
    VALUES
    ($1,$2,$3,$4)
    RETURNING *
    `,
    [data.userId, data.workDone, data.tomorrowPlan, data.reportDate],
  );

  return result.rows[0];
};
const getMyReports = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM reports
    WHERE user_id = $1
    ORDER BY report_date DESC
    `,
    [userId],
  );

  return result.rows;
};
const getTeamReports = async () => {
  const result = await pool.query(`
    SELECT
      r.id,
      r.work_done,
      r.tomorrow_plan,
      r.admin_remarks,
      r.status,
      r.report_date,
      u.employee_id,
      u.name,
      g.group_name
    FROM reports r
    JOIN users u
      ON r.user_id = u.id
    LEFT JOIN groups g
      ON u.group_id = g.id
    ORDER BY r.report_date DESC
  `);

  return result.rows;
};
const reviewReport = async (reportId, status, adminRemarks) => {
  const result = await pool.query(
    `
    UPDATE reports
    SET
      status = $1,
      admin_remarks = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
    `,
    [status, adminRemarks, reportId],
  );

  return result.rows[0];
};
const getReportById = async (reportId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM reports
    WHERE id = $1
    `,
    [reportId],
  );

  return result.rows[0];
};
const updateReport = async (reportId, workDone, tomorrowPlan) => {
  const result = await pool.query(
    `
    UPDATE reports
    SET
      work_done = $1,
      tomorrow_plan = $2,
      updated_at = CURRENT_TIMESTAMP,
      status = 'PENDING'
    WHERE id = $3
    RETURNING *
    `,
    [workDone, tomorrowPlan, reportId],
  );

  return result.rows[0];
};

module.exports = {
  createReport,
  getMyReports,
  getTeamReports,
  reviewReport,
  getReportById,
  updateReport,
};
