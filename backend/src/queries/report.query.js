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
const getMyReports = async (userId, page, limit, status, reportDate) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
    SELECT *
    FROM reports
    WHERE
      user_id = $1
      AND ($2 = '' OR status = $2)
      AND ($3::date IS NULL OR report_date = $3)
    ORDER BY report_date DESC
    LIMIT $4 OFFSET $5
    `,
    [userId, status, reportDate || null, limit, offset],
  );

  const totalResult = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM reports
    WHERE
      user_id = $1
      AND ($2 = '' OR status = $2)
      AND ($3::date IS NULL OR report_date = $3)
    `,
    [userId, status, reportDate || null],
  );

  return {
    reports: result.rows,
    total: Number(totalResult.rows[0].total),
  };
};
const getTeamReports = async (
  groupId,
  page,
  limit,
  search,
  status,
  reportDate,
) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
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
    WHERE
      u.group_id = $1
      AND (
        u.name ILIKE $2
        OR u.employee_id ILIKE $2
      )
      AND ($3 = '' OR r.status = $3)
      AND ($4::date IS NULL OR r.report_date = $4)
    ORDER BY r.report_date DESC
    LIMIT $5 OFFSET $6
    `,
    [groupId, `%${search}%`, status, reportDate || null, limit, offset],
  );

  const totalResult = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM reports r
    JOIN users u
      ON r.user_id = u.id
    WHERE
      u.group_id = $1
      AND (
        u.name ILIKE $2
        OR u.employee_id ILIKE $2
      )
      AND ($3 = '' OR r.status = $3)
      AND ($4::date IS NULL OR r.report_date = $4)
    `,
    [groupId, `%${search}%`, status, reportDate || null],
  );

  return {
    reports: result.rows,
    total: Number(totalResult.rows[0].total),
  };
};
const reviewReport = async (reportId, status, adminRemarks, reviewedBy) => {
  const result = await pool.query(
    `
  UPDATE reports
  SET
    status = $1,
    admin_remarks = $2,
    reviewed_by = $3,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $4
  RETURNING *
  `,
    [status, adminRemarks, reviewedBy, reportId],
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
const getAllTeamReports = async (page, limit, search, status, reportDate) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
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
    WHERE
      (
        u.name ILIKE $1
        OR u.employee_id ILIKE $1
      )
      AND ($2 = '' OR r.status = $2)
      AND ($3::date IS NULL OR r.report_date = $3)
    ORDER BY r.report_date DESC
    LIMIT $4 OFFSET $5
    `,
    [`%${search}%`, status, reportDate || null, limit, offset],
  );

  const totalResult = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM reports r
    JOIN users u
      ON r.user_id = u.id
    WHERE
      (
        u.name ILIKE $1
        OR u.employee_id ILIKE $1
      )
      AND ($2 = '' OR r.status = $2)
      AND ($3::date IS NULL OR r.report_date = $3)
    `,
    [`%${search}%`, status, reportDate || null],
  );

  return {
    reports: result.rows,
    total: Number(totalResult.rows[0].total),
  };
};
const getReportsForExport = async () => {
  const result = await pool.query(`
    SELECT
      u.employee_id,
      u.name,
      g.group_name,
      r.report_date,
      r.work_done,
      r.tomorrow_plan,
      r.status,
      reviewer.name AS reviewed_by,
      r.admin_remarks
    FROM reports r
    JOIN users u
      ON r.user_id = u.id
    LEFT JOIN groups g
      ON u.group_id = g.id
    LEFT JOIN users reviewer
      ON r.reviewed_by = reviewer.id
    ORDER BY r.report_date DESC
  `);

  return result.rows;
};
module.exports = {
  createReport,
  getMyReports,
  getTeamReports,
  reviewReport,
  getReportById,
  updateReport,
  getAllTeamReports,
  getReportsForExport,
};
