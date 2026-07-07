const Joi = require("joi");

const idParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "number.min": "ID must be a positive integer",
    "any.required": "ID path parameter is required",
  }),
});

const createEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a 10-digit number",
      "any.required": "Phone number is required",
    }),
  designation: Joi.string().min(2).max(100).required().messages({
    "string.min": "Designation must be at least 2 characters",
    "string.max": "Designation cannot exceed 100 characters",
    "any.required": "Designation is required",
  }),
  groupIds: Joi.array().items(Joi.number().integer().min(1)).min(1).required().messages({
    "array.base": "Group IDs must be an array of numbers",
    "any.required": "Group IDs are required",
  }),
});

const updateEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  designation: Joi.string().min(2).max(100).required(),
  groupIds: Joi.array().items(Joi.number().integer().min(1)).min(1).required(),
  status: Joi.boolean().required().messages({
    "any.required": "Status is required",
  }),
});

const createAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  designation: Joi.string().min(2).max(100).required(),
  groupIds: Joi.array().items(Joi.number().integer().min(1)).min(1).required(),
});

const updateAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  designation: Joi.string().min(2).max(100).required(),
  groupIds: Joi.array().items(Joi.number().integer().min(1)).min(1).required(),
});

const assignAdminGroupSchema = Joi.object({
  groupIds: Joi.array().items(Joi.number().integer().min(1)).min(1).required().messages({
    "any.required": "Group IDs array is required",
  }),
});

const updateAdminStatusSchema = Joi.object({
  status: Joi.boolean().required().messages({
    "any.required": "Status is required",
  }),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(""),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must be at most 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a 10-digit number",
      "any.required": "Phone number is required",
    }),
});

module.exports = {
  idParamSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  createAdminSchema,
  updateAdminSchema,
  assignAdminGroupSchema,
  updateAdminStatusSchema,
  paginationSchema,
  updateProfileSchema,
};
