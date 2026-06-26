const authQuery = require("../queries/auth.query");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userQuery = require("../queries/user.query");
const createAuditLog = require("../utils/createAuditLog");

const login = async (employeeId, password) => {
  const user = await authQuery.getUserByEmployeeId(employeeId);

  if (!user) {
    throw new Error("Invalid Employee ID");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid Password");
  }

  delete user.password;

  const token = jwt.sign(
    {
      userId: user.id,
      roleId: user.role_id,
      employeeId: user.employee_id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  return {
    token,
    user,
  };
};
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userQuery.getUserById(userId);

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await userQuery.changePassword(userId, hashedPassword);

  await createAuditLog(
    userId,
    "CHANGE_PASSWORD",
    "USER",
    userId,
    "Changed own password",
  );

  return updatedUser;
};
module.exports = {
  login,
  changePassword,
};
