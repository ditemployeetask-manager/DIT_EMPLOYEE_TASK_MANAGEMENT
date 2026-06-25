const userService = require("../services/user.service");

const createEmployee = async (req, res) => {
  try {
    const result = await userService.createEmployee(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllEmployees = async (req, res) => {
  try {
    const employees = await userService.getAllEmployees();

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getEmployeeById = async (req, res) => {
  try {
    const employee = await userService.getEmployeeById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await userService.updateEmployee(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const result = await userService.createAdmin(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const assignAdminGroup = async (req, res) => {
  try {
    const admin = await userService.assignAdminGroup(
      req.params.id,
      req.body.groupId,
    );

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllAdmins = async (req, res) => {
  try {
    const admins = await userService.getAllAdmins();

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAdminById = async (req, res) => {
  try {
    const admin = await userService.getAdminById(req.params.id);

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateAdmin = async (req, res) => {
  try {
    const admin = await userService.updateAdmin(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const updateAdminStatus = async (req, res) => {
  try {
    const admin = await userService.updateAdminStatus(
      req.params.id,
      req.body.status,
    );

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const result = await userService.resetPassword(req.params.id);

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
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  createAdmin,
  assignAdminGroup,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  updateAdminStatus,
  resetPassword,
};