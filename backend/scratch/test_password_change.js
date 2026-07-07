require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../src/config/db");
const authService = require("../src/services/auth.service");
const userService = require("../src/services/user.service");
const bcrypt = require("bcrypt");

const test = async () => {
  try {
    console.log("--- Creating test employee ---");
    const empData = {
      name: "Password Tester",
      email: "pwtester@dit.com",
      phone: "9876543299",
      designation: "Tester",
      groupIds: [1]
    };
    // Superadmin ID = 4
    const result = await userService.createEmployee(empData, 4);
    const employeeId = result.employeeId;
    const tempPassword = result.temporaryPassword;
    const empUser = result.employee;
    console.log(`Created: ID=${employeeId}, TempPassword=${tempPassword}, must_change_password=${empUser.must_change_password}`);

    console.log("\n--- Logging in with temporary password ---");
    const login1 = await authService.login(employeeId, tempPassword);
    console.log("Login 1 returned user:", JSON.stringify(login1.user));

    console.log("\n--- Changing password ---");
    const newPassword = "NewPassword123!";
    const changeRes = await authService.changePassword(login1.user.id, tempPassword, newPassword);
    console.log("ChangePassword returned:", JSON.stringify(changeRes));

    console.log("\n--- Logging in with NEW password ---");
    const login2 = await authService.login(employeeId, newPassword);
    console.log("Login 2 returned user:", JSON.stringify(login2.user));

    // Clean up
    console.log("\n--- Cleaning up ---");
    await pool.query("DELETE FROM users WHERE id = $1", [login1.user.id]);
    console.log("Cleaned up successfully!");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await pool.end();
  }
};

test();
