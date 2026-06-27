const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { loginSchema, changePasswordSchema } = require("../validations/auth.validation");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Login using Employee ID and Password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - password
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: DIT-EMP-0001
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validate(loginSchema), authController.login);

router.put(
  "/change-password",
  verifyToken,
  authorizeRoles(1, 2, 3),
  validate(changePasswordSchema),
  authController.changePassword,
);

module.exports = router;
