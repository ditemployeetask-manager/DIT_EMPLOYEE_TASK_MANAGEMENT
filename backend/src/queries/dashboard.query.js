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
) AS rejected_reports,

COUNT(*) FILTER (
WHERE report_date = CURRENT_DATE
) AS today_reports

FROM reports

WHERE user_id = $1
    `,
    [userId],
  );

  return result.rows[0];
};
const getAdminStats = async (userId) => {
  
  const userResult = await pool.query(
    `
    SELECT group_id
    FROM users
    WHERE id = $1
    `,
    [userId],
  );

  const groupId = userResult.rows[0].group_id;

  
  const result = await pool.query(
    `
    SELECT

      (
        SELECT COUNT(*)
        FROM users
        WHERE role_id = 3
        AND group_id = $1
      ) AS total_employees,

      (
        SELECT COUNT(*)
        FROM reports r
        JOIN users u
          ON r.user_id = u.id
        WHERE
          u.group_id = $1
          AND r.status = 'PENDING'
      ) AS pending_reviews,

      (
        SELECT COUNT(*)
        FROM reports r
        JOIN users u
          ON r.user_id = u.id
        WHERE
          u.group_id = $1
          AND r.status = 'APPROVED'
      ) AS approved_reports,

      (
        SELECT COUNT(*)
        FROM reports r
        JOIN users u
          ON r.user_id = u.id
        WHERE
          u.group_id = $1
          AND r.status = 'REJECTED'
      ) AS rejected_reports,

      (
        SELECT COUNT(*)
        FROM reports r
        JOIN users u
          ON r.user_id = u.id
        WHERE
          u.group_id = $1
          AND r.report_date = CURRENT_DATE
      ) AS today_reports
    `,
    [groupId],
  );

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
) AS total_reports,

(
SELECT COUNT(*)
FROM reports
WHERE status = 'PENDING'
) AS pending_reports,

(
SELECT COUNT(*)
FROM reports
WHERE status = 'APPROVED'
) AS approved_reports,

(
SELECT COUNT(*)
FROM reports
WHERE status = 'REJECTED'
) AS rejected_reports,

(
SELECT COUNT(*)
FROM reports
WHERE report_date = CURRENT_DATE
) AS today_reports
`);

  return result.rows[0];
};
module.exports = {
  getEmployeeStats,
  getAdminStats,
  getSuperAdminStats,
};
