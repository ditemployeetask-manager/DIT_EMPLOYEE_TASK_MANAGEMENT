const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/login", authController.login);

router.put(
  "/change-password",
  verifyToken,
  authorizeRoles(1, 2, 3),
  authController.changePassword,
);

module.exports = router;
