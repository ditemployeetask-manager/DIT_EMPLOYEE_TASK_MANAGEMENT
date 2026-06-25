const authService = require("../services/auth.service");

const login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    const user = await authService.login(employeeId, password);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
const changePassword = async (req, res) => {
  try {
    const result = await authService.changePassword(
      req.user.userId,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  changePassword,
};
