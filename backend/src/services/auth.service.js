const authQuery = require("../queries/auth.query");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

module.exports = {
  login,
};
