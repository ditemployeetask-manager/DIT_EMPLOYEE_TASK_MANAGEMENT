const generateEmployeeId = require("../utils/generateEmployeeId");
const userQuery = require("../queries/user.query");
const generatePassword = require("../utils/generatePassword");
const bcrypt = require("bcrypt");
const generateAdminId = require("../utils/generateAdminId");
const createNotification = require("../utils/createNotification");
const createAuditLog = require("../utils/createAuditLog");

const createEmployee = async (employeeData, createdBy) => {
  const emailExists = await userQuery.getUserByEmail(employeeData.email);

  if (emailExists) {
    throw new Error("Email already exists");
  }

  const phoneExists = await userQuery.getUserByPhone(employeeData.phone);

  if (phoneExists) {
    throw new Error("Phone number already exists");
  }
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
  createdBy,
});

  delete employee.password;
  await createNotification(
    employee.id,
    "Welcome",
    `Welcome to DIT Employee Task Management.

Employee ID: ${employee.employee_id}

Please change your temporary password after first login.`,
  );
  await createAuditLog(
    createdBy,
    "CREATE_EMPLOYEE",
    "USER",
    employee.id,
    `Created employee ${employee.employee_id}`,
  );
  return {
    employeeId,
    temporaryPassword,
    employee,
  };
};

const getAllEmployees = async (page, limit, search) => {
  return await userQuery.getAllEmployees(page, limit, search);
};
const getEmployeeById = async (id) => {
  const employee = await userQuery.getEmployeeById(id);

  if (employee) {
    delete employee.password;
  }

  return employee;
};
const updateEmployee = async (id, employeeData, updatedBy) => {
  const employee = await userQuery.updateEmployee(id, employeeData);

  delete employee.password;
  await createAuditLog(
    updatedBy,
    "UPDATE_EMPLOYEE",
    "USER",
    employee.id,
    `Updated employee ${employee.employee_id}`,
  );

  return employee;
};

const createAdmin = async (adminData, createdBy) => {
  const emailExists = await userQuery.getUserByEmail(adminData.email);

  if (emailExists) {
    throw new Error("Email already exists");
  }

  const phoneExists = await userQuery.getUserByPhone(adminData.phone);

  if (phoneExists) {
    throw new Error("Phone number already exists");
  }
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
    createdBy,
  });

  delete admin.password;
  await createNotification(
    admin.id,
    "Welcome",
    `Welcome to DIT Employee Task Management.

Employee ID: ${admin.employee_id}

Please change your temporary password after first login.`,
  );
  await createAuditLog(
    createdBy,
    "CREATE_ADMIN",
    "USER",
    admin.id,
    `Created admin ${admin.employee_id}`,
  );
  return {
    adminId,
    temporaryPassword,
    admin,
  };
};
const assignAdminGroup = async (adminId, groupId, updatedBy) => {
  const admin = await userQuery.assignAdminGroup(adminId, groupId);

  await createAuditLog(
    updatedBy,
    "ASSIGN_ADMIN_GROUP",
    "USER",
    admin.id,
    `Assigned admin ${admin.employee_id} to group ${groupId}`,
  );

  return admin;
};
const getAllAdmins = async (page, limit, search) => {
  return await userQuery.getAllAdmins(page, limit, search);
};
const getAdminById = async (id) => {
  return await userQuery.getAdminById(id);
};
const updateAdmin = async (id, adminData, updatedBy) => {
  const admin = await userQuery.updateAdmin(id, adminData);

  await createAuditLog(
    updatedBy,
    "UPDATE_ADMIN",
    "USER",
    admin.id,
    `Updated admin ${admin.employee_id}`,
  );

  return admin;
};
const updateAdminStatus = async (id, status, updatedBy) => {
  const admin = await userQuery.updateAdminStatus(id, status);

  await createAuditLog(
    updatedBy,
    "UPDATE_ADMIN_STATUS",
    "USER",
    admin.id,
    `Changed status of admin ${admin.employee_id} to ${status}`,
  );

  return admin;
};
const resetPassword = async (userId, resetBy) => {
  const temporaryPassword = generatePassword();

  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  const user = await userQuery.resetPassword(userId, hashedPassword);

  await createNotification(
    user.id,
    "Password Reset",
    "Your password has been reset. Please login using the temporary password and change it immediately.",
  );
  await createAuditLog(
    resetBy,
    "RESET_PASSWORD",
    "USER",
    user.id,
    `Reset password for ${user.employee_id}`,
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