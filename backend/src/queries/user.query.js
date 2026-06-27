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
const getAllEmployees = async (page, limit, search) => {
  const offset = (page - 1) * limit;

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
    WHERE
      u.role_id = 3
      AND (
        u.name ILIKE $1 OR
        u.employee_id ILIKE $1 OR
        u.email ILIKE $1
      )
    ORDER BY u.id DESC
    LIMIT $2 OFFSET $3
    `,
    [`%${search}%`, limit, offset],
  );

  const totalResult = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM users
    WHERE
      role_id = 3
      AND (
        name ILIKE $1 OR
        employee_id ILIKE $1 OR
        email ILIKE $1
      )
    `,
    [`%${search}%`],
  );

  return {
    employees: result.rows,
    total: Number(totalResult.rows[0].total),
  };
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
const getAllAdmins = async (page, limit, search) => {
  const offset = (page - 1) * limit;

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
      g.group_name,
      u.created_at
    FROM users u
    LEFT JOIN groups g
      ON u.group_id = g.id
    WHERE
      u.role_id = 2
      AND (
        u.name ILIKE $1 OR
        u.employee_id ILIKE $1 OR
        u.email ILIKE $1
      )
    ORDER BY u.id DESC
    LIMIT $2 OFFSET $3
    `,
    [`%${search}%`, limit, offset],
  );

  const totalResult = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM users
    WHERE
      role_id = 2
      AND (
        name ILIKE $1 OR
        employee_id ILIKE $1 OR
        email ILIKE $1
      )
    `,
    [`%${search}%`],
  );

  return {
    admins: result.rows,
    total: Number(totalResult.rows[0].total),
  };
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
const getUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT id
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  return result.rows[0];
};
const getUserByPhone = async (phone) => {
  const result = await pool.query(
    `
    SELECT id
    FROM users
    WHERE phone = $1
    `,
    [phone],
  );

  return result.rows[0];
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
  getUserByEmail,
  getUserByPhone,
};
