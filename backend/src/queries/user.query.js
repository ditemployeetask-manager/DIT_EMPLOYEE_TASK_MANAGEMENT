const pool = require("../config/db");

const getLastEmployee = async () => {
  const result = await pool.query(`
    SELECT employee_id
    FROM users
    WHERE employee_id LIKE 'DIT-EMP-%'
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.rows[0];
};
const createEmployee = async (data) => {
  const result = await pool.query(
    `
      INSERT INTO users (
    employee_id,
    name,
    email,
    phone,
    password,
    role_id,
    group_id,
    designation,
    created_by
)
VALUES
($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `,
    [
      data.employeeId,
      data.name,
      data.email,
      data.phone,
      data.password,
      data.roleId,
      data.groupId,
      data.designation,
      data.createdBy,
    ],
  );

  return result.rows[0];
};
const getAllEmployees = async () => {
  const result = await pool.query(`
    SELECT
      u.id,
      u.employee_id,
      u.name,
      u.email,
      u.phone,
      u.designation,
      g.group_name,
      u.status,
      u.created_at
    FROM users u
    LEFT JOIN groups g
      ON u.group_id = g.id
    WHERE u.role_id = 3
    ORDER BY u.id DESC
  `);

  return result.rows;
};
const getEmployeeById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.employee_id,
      u.name,
      u.email,
      u.phone,
      u.designation,
      g.group_name,
      u.status,
      u.created_at
    FROM users u
    LEFT JOIN groups g
      ON u.group_id = g.id
    WHERE u.id = $1
      AND u.role_id = 3
    `,
    [id],
  );

  return result.rows[0];
};

const updateEmployee = async (id, data) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      name = $1,
      email = $2,
      phone = $3,
      designation = $4,
      group_id = $5,
      status = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *
    `,
    [
      data.name,
      data.email,
      data.phone,
      data.designation,
      data.groupId,
      data.status,
      id,
    ],
  );

  return result.rows[0];
};
const getLastAdmin = async () => {
  const result = await pool.query(`
    SELECT employee_id
    FROM users
    WHERE employee_id LIKE 'DIT-ADM-%'
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.rows[0];
};
const getLastUser = async () => {
  const result = await pool.query(`
    SELECT employee_id
    FROM users
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.rows[0];
};
const assignAdminGroup = async (adminId, groupId) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      group_id = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE
      id = $2
      AND role_id = 2
    RETURNING
      id,
      employee_id,
      name,
      role_id,
      group_id
    `,
    [groupId, adminId],
  );

  return result.rows[0];
};
const getUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};
const getAllAdmins = async () => {
  const result = await pool.query(`
    SELECT
      u.id,
      u.employee_id,
      u.name,
      u.email,
      u.phone,
      u.designation,
      u.status,
      g.group_name,
      u.created_at
    FROM users u
    LEFT JOIN groups g
      ON u.group_id = g.id
    WHERE u.role_id = 2
    ORDER BY u.id ASC
  `);

  return result.rows;
};
const getAdminById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.employee_id,
      u.name,
      u.email,
      u.phone,
      u.designation,
      u.status,
      u.group_id,
      g.group_name,
      u.created_at,
      u.updated_at
    FROM users u
    LEFT JOIN groups g
      ON u.group_id = g.id
    WHERE
      u.id = $1
      AND u.role_id = 2
    `,
    [id],
  );

  return result.rows[0];
};
const updateAdmin = async (id, adminData) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      name = $1,
      email = $2,
      phone = $3,
      designation = $4,
      group_id = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE
      id = $6
      AND role_id = 2
    RETURNING
      id,
      employee_id,
      name,
      email,
      phone,
      designation,
      group_id,
      status,
      updated_at
    `,
    [
      adminData.name,
      adminData.email,
      adminData.phone,
      adminData.designation,
      adminData.groupId,
      id,
    ],
  );

  return result.rows[0];
};
const updateAdminStatus = async (id, status) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE
      id = $2
      AND role_id = 2
    RETURNING
      id,
      employee_id,
      name,
      status,
      updated_at
    `,
    [status, id],
  );

  return result.rows[0];
};
const changePassword = async (userId, password) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      password = $1,
      must_change_password = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      employee_id,
      must_change_password
    `,
    [password, userId],
  );

  return result.rows[0];
};
const resetPassword = async (userId, password) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      password = $1,
      must_change_password = true,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      employee_id,
      name,
      email,
      must_change_password
    `,
    [password, userId],
  );

  return result.rows[0];
};
const getAdminsByGroup = async (groupId) => {
  const result = await pool.query(
    `
    SELECT id, name
    FROM users
    WHERE
      role_id = 2
      AND group_id = $1
      AND status = true
    `,
    [groupId],
  );

  return result.rows;
};
module.exports = {
  getLastEmployee,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  getLastAdmin,
  getLastUser,
  assignAdminGroup,
  getUserById,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  updateAdminStatus,
  changePassword,
  resetPassword,
  getAdminsByGroup,
};
