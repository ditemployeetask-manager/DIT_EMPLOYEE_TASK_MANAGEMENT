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
  // Fetch all assigned group IDs for the admin
  const groupsResult = await pool.query(
    `
    SELECT group_id
    FROM user_groups
    WHERE user_id = $1
    `,
    [userId]
  );
  
  const groupIds = groupsResult.rows.map(row => row.group_id);
  
  if (groupIds.length === 0) {
    return {
      total_employees: 0,
      pending_reviews: 0,
      approved_reports: 0,
      rejected_reports: 0,
      today_reports: 0
    };
  }

  const result = await pool.query(
    `
    SELECT
      (
        SELECT COUNT(DISTINCT u.id)
        FROM users u
        JOIN user_groups ug ON u.id = ug.user_id
        WHERE u.role_id = 3
        AND ug.group_id = ANY($1)
      ) AS total_employees,

      (
        SELECT COUNT(DISTINCT r.id)
        FROM reports r
        JOIN users u ON r.user_id = u.id
        JOIN user_groups ug ON u.id = ug.user_id
        WHERE ug.group_id = ANY($1)
        AND r.status = 'PENDING'
      ) AS pending_reviews,

      (
        SELECT COUNT(DISTINCT r.id)
        FROM reports r
        JOIN users u ON r.user_id = u.id
        JOIN user_groups ug ON u.id = ug.user_id
        WHERE ug.group_id = ANY($1)
        AND r.status = 'APPROVED'
      ) AS approved_reports,

      (
        SELECT COUNT(DISTINCT r.id)
        FROM reports r
        JOIN users u ON r.user_id = u.id
        JOIN user_groups ug ON u.id = ug.user_id
        WHERE ug.group_id = ANY($1)
        AND r.status = 'REJECTED'
      ) AS rejected_reports,

      (
        SELECT COUNT(DISTINCT r.id)
        FROM reports r
        JOIN users u ON r.user_id = u.id
        JOIN user_groups ug ON u.id = ug.user_id
        WHERE ug.group_id = ANY($1)
        AND r.report_date = CURRENT_DATE
      ) AS today_reports
    `,
    [groupIds],
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
