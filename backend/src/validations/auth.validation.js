const Joi = require("joi");

const loginSchema = Joi.object({
  employeeId: Joi.string()
    .pattern(/^[A-Z0-9-]+$/)
    .required()
    .messages({
      "string.pattern.base": "Employee ID must contain only uppercase letters, numbers, and hyphens",
      "any.required": "Employee ID is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "New password must be at least 6 characters long",
    "any.required": "New password is required",
  }),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
};
