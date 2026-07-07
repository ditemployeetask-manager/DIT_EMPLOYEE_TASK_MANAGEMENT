const pool = require("../src/config/db");

async function check() {
  try {
    const res = await pool.query("SELECT * FROM users WHERE id = 4");
    console.log("User 4 details:", res.rows[0]);
    
    const userGroups = await pool.query("SELECT * FROM user_groups WHERE user_id = 4");
    console.log("User 4 groups:", userGroups.rows);

    const admins = await pool.query("SELECT * FROM users WHERE role_id = 2");
    console.log("Admins:", admins.rows);

    const adminGroups = await pool.query("SELECT * FROM user_groups WHERE user_id IN (SELECT id FROM users WHERE role_id = 2)");
    console.log("Admin groups:", adminGroups.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
