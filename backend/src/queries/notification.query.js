const pool = require("../config/db");

const createNotification = async (notificationData) => {
  const result = await pool.query(
    `
    INSERT INTO notifications
    (
      user_id,
      title,
      message
    )
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [notificationData.userId, notificationData.title, notificationData.message],
  );

  return result.rows[0];
};
const getMyNotifications = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      title,
      message,
      is_read,
      created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows;
};
const markAsRead = async (id) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET
      is_read = true
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};
const getUnreadCount = async (userId) => {
  const result = await pool.query(
    `
    SELECT COUNT(*) AS unread_count
    FROM notifications
    WHERE
      user_id = $1
      AND is_read = false
    `,
    [userId],
  );

  return result.rows[0];
};
const markAllAsRead = async (userId) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET
      is_read = true
    WHERE
      user_id = $1
      AND is_read = false
    RETURNING *
    `,
    [userId],
  );

  return result.rows;
};
module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  getUnreadCount,
  markAllAsRead,
};
