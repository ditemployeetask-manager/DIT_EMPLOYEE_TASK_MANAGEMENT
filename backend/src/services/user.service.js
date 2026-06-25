const generateEmployeeId = require("../utils/generateEmployeeId");
const userQuery = require("../queries/user.query");
const generatePassword = require("../utils/generatePassword");
const bcrypt = require("bcrypt");
const generateAdminId = require("../utils/generateAdminId");
const createNotification = require("../utils/createNotification");

const createEmployee = async (employeeData) => {
  const lastEmployee = await userQuery.getLastEmployee();

  const employeeId = generateEmployeeId(lastEmployee?.employee_id);

  const temporaryPassword = generatePassword();

  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  const employee = await userQuery.createEmployee({
    employeeId,
    name: employeeData.name,
    email: employeeData.email,
    phone: employeeData.phone,
    password: hashedPassword,
    roleId: 3,
    groupId: employeeData.groupId,
    designation: employeeData.designation,
  });

  delete employee.password;
  await createNotification(
    employee.id,
    "Welcome",
    `Welcome to DIT Employee Task Management.

Employee ID: ${employee.employee_id}

Please change your temporary password after first login.`,
  );
  return {
    employeeId,
    temporaryPassword,
    employee,
  };
};

const getAllEmployees = async () => {
  return await userQuery.getAllEmployees();
};
const getEmployeeById = async (id) => {
  const employee = await userQuery.getEmployeeById(id);

  if (employee) {
    delete employee.password;
  }

  return employee;
};
const updateEmployee = async (id, employeeData) => {
  const employee = await userQuery.updateEmployee(id, employeeData);

  delete employee.password;

  return employee;
};

const createAdmin = async (adminData) => {
  const lastUser = await userQuery.getLastUser();

  const adminId = generateAdminId(lastUser?.employee_id);

  const temporaryPassword = generatePassword();

  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  const admin = await userQuery.createEmployee({
    employeeId: adminId,
    name: adminData.name,
    email: adminData.email,
    phone: adminData.phone,
    password: hashedPassword,
    roleId: 2,
    groupId: adminData.groupId,
    designation: adminData.designation,
  });

  delete admin.password;

  return {
    adminId,
    temporaryPassword,
    admin,
  };
};
const assignAdminGroup = async (adminId, groupId) => {
  return await userQuery.assignAdminGroup(adminId, groupId);
};
const getAllAdmins = async () => {
  return await userQuery.getAllAdmins();
};
const getAdminById = async (id) => {
  return await userQuery.getAdminById(id);
};
const updateAdmin = async (id, adminData) => {
  return await userQuery.updateAdmin(id, adminData);
};
const updateAdminStatus = async (id, status) => {
  return await userQuery.updateAdminStatus(id, status);
};
const resetPassword = async (userId) => {
  const temporaryPassword = generatePassword();

  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  const user = await userQuery.resetPassword(userId, hashedPassword);

  await createNotification(
    user.id,
    "Password Reset",
    "Your password has been reset. Please login using the temporary password and change it immediately.",
  );

  return {
    temporaryPassword,
    user,
  };
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