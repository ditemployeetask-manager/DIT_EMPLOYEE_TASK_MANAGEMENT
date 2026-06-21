const pool = require("../config/db");

const getUserByEmployeeId = async (employeeId) => {
  const result = await pool.query(
    `
    SELECT
      u.*,
      r.role_name
    FROM users u
    JOIN roles r
      ON u.role_id = r.id
    WHERE u.employee_id = $1
    `,
    [employeeId],
  );

  return result.rows[0];
};

module.exports = {
  getUserByEmployeeId,
};
