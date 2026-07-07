const pool = require("../src/config/db");

const runMigration = async () => {
  const client = await pool.connect();
  try {
    console.log("Starting many-to-many group migration...");
    await client.query("BEGIN");

   
    console.log("Creating user_groups junction table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_groups (
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, group_id)
      )
    `);

   
    console.log("Migrating existing user group associations...");
    await client.query(`
      INSERT INTO user_groups (user_id, group_id)
      SELECT id, group_id
      FROM users
      WHERE group_id IS NOT NULL
      ON CONFLICT DO NOTHING
    `);
    console.log("Checking and dropping old group_id column on users...");

    const fkResult = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'users' AND constraint_type = 'FOREIGN KEY'
    `);
    for (const row of fkResult.rows) {
      if (row.constraint_name.includes("group") || row.constraint_name.includes("users_group_id_fkey")) {
        await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS "${row.constraint_name}" CASCADE`);
      }
    }
    await client.query("ALTER TABLE users DROP COLUMN IF EXISTS group_id CASCADE");

    await client.query("COMMIT");
    console.log("Migration completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
