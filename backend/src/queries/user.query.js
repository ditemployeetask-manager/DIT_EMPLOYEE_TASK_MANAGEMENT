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
      INSERT INTO users
      (
        employee_id,
        name,
        email,
        phone,
        password,
        role_id,
        group_id,
        designation
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
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

module.exports = {
  getLastEmployee,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  getLastAdmin,
  getLastUser,
};
