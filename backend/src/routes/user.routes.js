const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/employees", userController.createEmployee);
router.get(
  "/employees",
  verifyToken,
  authorizeRoles(1, 2),
  userController.getAllEmployees,
);
router.get("/employees/:id", userController.getEmployeeById);
router.put("/employees/:id", userController.updateEmployee);
router.post(
  "/admins",
  verifyToken,
  authorizeRoles(1),
  userController.createAdmin,
);

module.exports = router;
