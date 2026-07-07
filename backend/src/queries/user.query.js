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
      designation,
      created_by
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
      data.designation,
      data.createdBy,
    ],
  );

  const user = result.rows[0];

  if (data.groupIds && data.groupIds.length > 0) {
    for (const gId of data.groupIds) {
      await pool.query(
        "INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)",
        [user.id, gId]
      );
    }
  }

  if (data.roleId === 2) {
    return await getAdminById(user.id);
  }
  return await getEmployeeById(user.id);
};

const getAllEmployees = async (page, limit, search, roleId = 1, userId = null) => {
  const offset = (page - 1) * limit;

  if (roleId === 2) {
    
    const groupsResult = await pool.query(
      "SELECT group_id FROM user_groups WHERE user_id = $1",
      [userId]
    );
    const groupIds = groupsResult.rows.map(row => row.group_id);
    if (groupIds.length === 0) {
      return { employees: [], total: 0 };
    }

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
        u.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', g.id, 'group_name', g.group_name)
          ) FILTER (WHERE g.id IS NOT NULL),
          '[]'
        ) AS groups
      FROM users u
      JOIN user_groups ug_filter ON u.id = ug_filter.user_id AND ug_filter.group_id = ANY($1)
      LEFT JOIN user_groups ug ON u.id = ug.user_id
      LEFT JOIN groups g ON ug.group_id = g.id
      WHERE
        u.role_id = 3
        AND (
          u.name ILIKE $2 OR
          u.employee_id ILIKE $2 OR
          u.email ILIKE $2
        )
      GROUP BY u.id
      ORDER BY u.id DESC
      LIMIT $3 OFFSET $4
      `,
      [groupIds, `%${search}%`, limit, offset]
    );

    const totalResult = await pool.query(
      `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM users u
      JOIN user_groups ug_filter ON u.id = ug_filter.user_id AND ug_filter.group_id = ANY($1)
      WHERE
        u.role_id = 3
        AND (
          u.name ILIKE $2 OR
          u.employee_id ILIKE $2 OR
          u.email ILIKE $2
        )
      `,
      [groupIds, `%${search}%`]
    );

    return {
      employees: result.rows,
      total: Number(totalResult.rows[0].total),
    };
  }

  // Super Admin filtering
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
      u.created_at,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', g.id, 'group_name', g.group_name)
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS groups
    FROM users u
    LEFT JOIN user_groups ug ON u.id = ug.user_id
    LEFT JOIN groups g ON ug.group_id = g.id
    WHERE
      u.role_id = 3
      AND (
        u.name ILIKE $1 OR
        u.employee_id ILIKE $1 OR
        u.email ILIKE $1
      )
    GROUP BY u.id
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
      u.status,
      u.created_at,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', g.id, 'group_name', g.group_name)
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS groups
    FROM users u
    LEFT JOIN user_groups ug ON u.id = ug.user_id
    LEFT JOIN groups g ON ug.group_id = g.id
    WHERE u.id = $1
      AND u.role_id = 3
    GROUP BY u.id
    `,
    [id],
  );

  return result.rows[0];
};

const updateEmployee = async (id, data) => {
  await pool.query(
    `
    UPDATE users
    SET
      name = $1,
      email = $2,
      phone = $3,
      designation = $4,
      status = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    `,
    [
      data.name,
      data.email,
      data.phone,
      data.designation,
      data.status,
      id,
    ],
  );

  await pool.query("DELETE FROM user_groups WHERE user_id = $1", [id]);
  if (data.groupIds && data.groupIds.length > 0) {
    for (const gId of data.groupIds) {
      await pool.query(
        "INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)",
        [id, gId]
      );
    }
  }

  return await getEmployeeById(id);
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

const assignAdminGroup = async (adminId, groupIds) => {
  await pool.query("DELETE FROM user_groups WHERE user_id = $1", [adminId]);
  if (groupIds && groupIds.length > 0) {
    for (const gId of groupIds) {
      await pool.query(
        "INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)",
        [adminId, gId]
      );
    }
  }

  return await getAdminById(adminId);
};

const getUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      u.*,
      COALESCE(
        JSON_AGG(ug.group_id) FILTER (WHERE ug.group_id IS NOT NULL),
        '[]'
      ) AS group_ids
    FROM users u
    LEFT JOIN user_groups ug ON u.id = ug.user_id
    WHERE u.id = $1
    GROUP BY u.id
    `,
    [id],
  );

  const user = result.rows[0];
  
  if (user) {
    user.group_ids = Array.isArray(user.group_ids) ? user.group_ids : [];
  }
  return user;
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
      u.created_at,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', g.id, 'group_name', g.group_name)
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS groups
    FROM users u
    LEFT JOIN user_groups ug ON u.id = ug.user_id
    LEFT JOIN groups g ON ug.group_id = g.id
    WHERE
      u.role_id = 2
      AND (
        u.name ILIKE $1 OR
        u.employee_id ILIKE $1 OR
        u.email ILIKE $1
      )
    GROUP BY u.id
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
      u.created_at,
      u.updated_at,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', g.id, 'group_name', g.group_name)
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS groups
    FROM users u
    LEFT JOIN user_groups ug ON u.id = ug.user_id
    LEFT JOIN groups g ON ug.group_id = g.id
    WHERE
      u.id = $1
      AND u.role_id = 2
    GROUP BY u.id
    `,
    [id],
  );

  return result.rows[0];
};

const updateAdmin = async (id, adminData) => {
  await pool.query(
    `
    UPDATE users
    SET
      name = $1,
      email = $2,
      phone = $3,
      designation = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE
      id = $5
      AND role_id = 2
    `,
    [
      adminData.name,
      adminData.email,
      adminData.phone,
      adminData.designation,
      id,
    ],
  );

  await pool.query("DELETE FROM user_groups WHERE user_id = $1", [id]);
  if (adminData.groupIds && adminData.groupIds.length > 0) {
    for (const gId of adminData.groupIds) {
      await pool.query(
        "INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)",
        [id, gId]
      );
    }
  }

  return await getAdminById(id);
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
    SELECT u.id, u.name
    FROM users u
    JOIN user_groups ug ON u.id = ug.user_id
    WHERE
      u.role_id = 2
      AND ug.group_id = $1
      AND u.status = true
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

const getProfile = async (id) => {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.employee_id,
      u.name,
      u.email,
      u.phone,
      u.designation,
      u.role_id,
      u.status,
      u.created_at,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', g.id, 'group_name', g.group_name)
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS groups
    FROM users u
    LEFT JOIN user_groups ug ON u.id = ug.user_id
    LEFT JOIN groups g ON ug.group_id = g.id
    WHERE u.id = $1
    GROUP BY u.id
    `,
    [id],
  );
  return result.rows[0];
};

const updateProfile = async (id, name, email, phone) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      name = $1,
      email = $2,
      phone = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, employee_id, name, email, phone, role_id, designation, status, created_at
    `,
    [name, email, phone, id]
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
  getProfile,
  updateProfile,
};
