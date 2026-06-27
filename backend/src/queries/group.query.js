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
const getAllGroups = async () => {
  const result = await pool.query(`
    SELECT *
    FROM groups
    ORDER BY id ASC
  `);

  return result.rows;
};
const getGroupById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM groups
    WHERE id = $1
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
