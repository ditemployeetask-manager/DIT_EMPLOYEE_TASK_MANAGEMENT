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

module.exports = {
  login,
};
