const pool = require("../config/db");

const createGroup = async (groupData) => {
  const result = await pool.query(
    `
    INSERT INTO groups
    (
      group_name,
      description
    )
    VALUES
    ($1, $2)
    RETURNING *
    `,
    [groupData.groupName, groupData.description],
  );

  return result.rows[0];
};
const getAllGroups = async (roleId = 1, userId = null) => {
  if (roleId === 2) {
    const result = await pool.query(
      `
      SELECT
        g.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', u.id, 'name', u.name, 'employee_id', u.employee_id)
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) AS admins
      FROM groups g
      JOIN user_groups ug_admin ON g.id = ug_admin.group_id AND ug_admin.user_id = $1
      LEFT JOIN user_groups ug ON g.id = ug.group_id
      LEFT JOIN users u ON ug.user_id = u.id AND u.role_id = 2
      GROUP BY g.id
      ORDER BY g.id ASC
      `,
      [userId]
    );
    return result.rows;
  }

  const result = await pool.query(`
    SELECT
      g.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', u.id, 'name', u.name, 'employee_id', u.employee_id)
        ) FILTER (WHERE u.id IS NOT NULL),
        '[]'
      ) AS admins
    FROM groups g
    LEFT JOIN user_groups ug ON g.id = ug.group_id
    LEFT JOIN users u ON ug.user_id = u.id AND u.role_id = 2
    GROUP BY g.id
    ORDER BY g.id ASC
  `);

  return result.rows;
};
const getGroupById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      g.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', u.id, 'name', u.name, 'employee_id', u.employee_id)
        ) FILTER (WHERE u.id IS NOT NULL),
        '[]'
      ) AS admins
    FROM groups g
    LEFT JOIN user_groups ug ON g.id = ug.group_id
    LEFT JOIN users u ON ug.user_id = u.id AND u.role_id = 2
    WHERE g.id = $1
    GROUP BY g.id
    `,
    [id],
  );

  return result.rows[0];
};
const updateGroup = async (id, groupData) => {
  const result = await pool.query(
    `
    UPDATE groups
    SET
      group_name = $1,
      description = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
    `,
    [groupData.groupName, groupData.description, id],
  );

  return result.rows[0];
};
const updateGroupStatus = async (id, status) => {
  const result = await pool.query(
    `
    UPDATE groups
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
    `,
    [status, id],
  );

  return result.rows[0];
};
const getGroupByName = async (groupName) => {
  const result = await pool.query(
    `
    SELECT id
    FROM groups
    WHERE LOWER(group_name) = LOWER($1)
    `,
    [groupName],
  );

  return result.rows[0];
};
module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  updateGroupStatus,
  getGroupByName,
};
