const Joi = require("joi");

const createAuditLogSchema = Joi.object({
  userId: Joi.number().integer().min(1).required().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "number.min": "User ID must be a positive integer",
    "any.required": "User ID is required",
  }),
  action: Joi.string().min(2).required().messages({
    "string.min": "Action must be at least 2 characters",
    "any.required": "Action is required",
  }),
  entityType: Joi.string().optional().allow(""),
  entityId: Joi.number().integer().min(0).optional(),
  description: Joi.string().optional().allow(""),
});

module.exports = {
  createAuditLogSchema,
};
