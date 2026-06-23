const pool = require("../config/db");

const getEmployeeStats = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      COUNT(*) AS total_reports,

      COUNT(*) FILTER (
        WHERE status = 'PENDING'
      ) AS pending_reports,

      COUNT(*) FILTER (
        WHERE status = 'APPROVED'
      ) AS approved_reports,

      COUNT(*) FILTER (
        WHERE status = 'REJECTED'
      ) AS rejected_reports

    FROM reports

    WHERE user_id = $1
    `,
    [userId],
  );

  return result.rows[0];
};
const getAdminStats = async () => {
  const result = await pool.query(`
    SELECT

      (
        SELECT COUNT(*)
        FROM users
        WHERE role_id = 3
      ) AS total_employees,

      (
        SELECT COUNT(*)
        FROM reports
        WHERE status = 'PENDING'
      ) AS pending_reviews,

      (
        SELECT COUNT(*)
        FROM reports
        WHERE status = 'APPROVED'
      ) AS approved_reports,

      (
        SELECT COUNT(*)
        FROM reports
        WHERE status = 'REJECTED'
      ) AS rejected_reports
  `);

  return result.rows[0];
};
const getSuperAdminStats = async () => {
  const result = await pool.query(`
    SELECT

      (
        SELECT COUNT(*)
        FROM users
        WHERE role_id = 3
      ) AS total_employees,

      (
        SELECT COUNT(*)
        FROM users
        WHERE role_id = 2
      ) AS total_admins,

      (
        SELECT COUNT(*)
        FROM groups
      ) AS total_groups,

      (
        SELECT COUNT(*)
        FROM reports
      ) AS total_reports
  `);

  return result.rows[0];
};
module.exports = {
  getEmployeeStats,
  getAdminStats,
  getSuperAdminStats,
};
