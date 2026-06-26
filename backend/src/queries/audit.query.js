const pool = require("../config/db");
const createAuditLog = async (auditData) => {
  const result = await pool.query(
    `
    INSERT INTO audit_logs
    (
      user_id,
      action,
      entity_type,
      entity_id,
      description
    )
    VALUES
    ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      auditData.userId,
      auditData.action,
      auditData.entityType,
      auditData.entityId,
      auditData.description,
    ],
  );

  return result.rows[0];
};
const getAllAuditLogs = async () => {
  const result = await pool.query(`
    SELECT
      a.id,
      u.employee_id,
      u.name,
      r.role_name,
      a.action,
      a.entity_type,
      a.entity_id,
      a.description,
      a.created_at
    FROM audit_logs a
    JOIN users u
      ON a.user_id = u.id
    JOIN roles r
      ON u.role_id = r.id
    ORDER BY a.created_at DESC
  `);

  return result.rows;
};
const getAuditLogById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      a.id,
      u.employee_id,
      u.name,
      r.role_name,
      a.action,
      a.entity_type,
      a.entity_id,
      a.description,
      a.created_at
    FROM audit_logs a
    JOIN users u
      ON a.user_id = u.id
    JOIN roles r
      ON u.role_id = r.id
    WHERE a.id = $1
    `,
    [id],
  );

  return result.rows[0];
};
module.exports = {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
};