const pool = require("../config/db");

const createReport = async (data) => {
  const result = await pool.query(
    `
    INSERT INTO reports (
      user_id,
      title,
      work_done,
      tomorrow_plan,
      report_date,
      attachments
    )
    VALUES
    ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [data.userId, data.title || "Daily Status Report", data.workDone, data.tomorrowPlan, data.reportDate, JSON.stringify(data.attachments || [])],
  );

  return result.rows[0];
};

const getMyReports = async (userId, page, limit, status, reportDate, startDate, endDate) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
    SELECT *
    FROM reports
    WHERE
      user_id = $1
      AND ($2 = '' OR status = $2)
      AND ($3::date IS NULL OR report_date = $3)
      AND ($4::date IS NULL OR report_date >= $4)
      AND ($5::date IS NULL OR report_date <= $5)
    ORDER BY report_date DESC
    LIMIT $6 OFFSET $7
    `,
    [userId, status, reportDate || null, startDate || null, endDate || null, limit, offset],
  );

  const totalResult = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM reports
    WHERE
      user_id = $1
      AND ($2 = '' OR status = $2)
      AND ($3::date IS NULL OR report_date = $3)
      AND ($4::date IS NULL OR report_date >= $4)
      AND ($5::date IS NULL OR report_date <= $5)
    `,
    [userId, status, reportDate || null, startDate || null, endDate || null],
  );

  return {
    reports: result.rows,
    total: Number(totalResult.rows[0].total),
  };
};

const getTeamReports = async (
  groupIds,
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
      r.title,
      r.work_done,
      r.tomorrow_plan,
      r.admin_remarks,
      r.status,
      r.report_date,
      u.employee_id,
      u.name,
      (
        SELECT ARRAY_TO_STRING(ARRAY_AGG(g.group_name), ', ')
        FROM user_groups ug
        JOIN groups g ON ug.group_id = g.id
        WHERE ug.user_id = u.id
      ) AS group_name
    FROM reports r
    JOIN users u
      ON r.user_id = u.id
    WHERE
      EXISTS (
        SELECT 1 FROM user_groups ug2
        WHERE ug2.user_id = u.id AND ug2.group_id = ANY($1)
      )
      AND (
        u.name ILIKE $2
        OR u.employee_id ILIKE $2
      )
      AND ($3 = '' OR r.status = $3)
      AND ($4::date IS NULL OR r.report_date = $4)
    ORDER BY r.report_date DESC
    LIMIT $5 OFFSET $6
    `,
    [groupIds, `%${search}%`, status, reportDate || null, limit, offset],
  );

  const totalResult = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM reports r
    JOIN users u
      ON r.user_id = u.id
    WHERE
      EXISTS (
        SELECT 1 FROM user_groups ug2
        WHERE ug2.user_id = u.id AND ug2.group_id = ANY($1)
      )
      AND (
        u.name ILIKE $2
        OR u.employee_id ILIKE $2
      )
      AND ($3 = '' OR r.status = $3)
      AND ($4::date IS NULL OR r.report_date = $4)
    `,
    [groupIds, `%${search}%`, status, reportDate || null],
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
      reviewed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
    [status, adminRemarks, reviewedBy, reportId],
  );

  return result.rows[0];
};

const getReportById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      r.*,
      u.name AS employee_name,
      u.employee_id AS employee_code,
      u.designation,
      reviewer.name AS reviewer_name,
      reviewer.employee_id AS reviewer_code,
      (
        SELECT ARRAY_TO_STRING(ARRAY_AGG(g.group_name), ', ')
        FROM user_groups ug
        JOIN groups g ON ug.group_id = g.id
        WHERE ug.user_id = u.id
      ) AS group_name
    FROM reports r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id
    WHERE r.id = $1
    `,
    [id],
  );

  return result.rows[0];
};

const updateReport = async (id, title, workDone, tomorrowPlan, attachments) => {
  const result = await pool.query(
    `
    UPDATE reports
    SET
      title = $1,
      work_done = $2,
      tomorrow_plan = $3,
      attachments = $4,
      status = 'PENDING',
      reviewed_by = NULL,
      reviewed_at = NULL,
      admin_remarks = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
    `,
    [title || "Daily Status Report", workDone, tomorrowPlan, JSON.stringify(attachments || []), id],
  );

  return result.rows[0];
};

const getAllTeamReports = async (page, limit, search, status, reportDate) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
    SELECT
      r.id,
      r.title,
      r.work_done,
      r.tomorrow_plan,
      r.admin_remarks,
      r.status,
      r.report_date,
      u.employee_id,
      u.name,
      (
        SELECT ARRAY_TO_STRING(ARRAY_AGG(g.group_name), ', ')
        FROM user_groups ug
        JOIN groups g ON ug.group_id = g.id
        WHERE ug.user_id = u.id
      ) AS group_name
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

const getReportsForExport = async (filters = {}) => {
  const { groupId, userId, roleId, startDate, endDate } = filters;
  const result = await pool.query(
    `
    SELECT
      u.employee_id,
      u.name,
      (
        SELECT ARRAY_TO_STRING(ARRAY_AGG(g.group_name), ', ')
        FROM user_groups ug
        JOIN groups g ON ug.group_id = g.id
        WHERE ug.user_id = u.id
      ) AS group_name,
      r.report_date,
      r.work_done,
      r.tomorrow_plan,
      r.status,
      reviewer.name AS reviewed_by,
      r.admin_remarks
    FROM reports r
    JOIN users u
      ON r.user_id = u.id
    LEFT JOIN users reviewer
      ON r.reviewed_by = reviewer.id
    WHERE
      ($1::integer IS NULL OR EXISTS (
        SELECT 1 FROM user_groups ug WHERE ug.user_id = u.id AND ug.group_id = $1
      ))
      AND ($2::integer IS NULL OR r.user_id = $2)
      AND ($3::integer IS NULL OR u.role_id = $3)
      AND ($4::date IS NULL OR r.report_date >= $4)
      AND ($5::date IS NULL OR r.report_date <= $5)
    ORDER BY r.report_date DESC
    `,
    [groupId || null, userId || null, roleId || null, startDate || null, endDate || null],
  );

  return result.rows;
};

const deleteReport = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM reports
    WHERE id = $1
    RETURNING *
    `,
    [id],
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
  getAllTeamReports,
  getReportsForExport,
  deleteReport,
};
