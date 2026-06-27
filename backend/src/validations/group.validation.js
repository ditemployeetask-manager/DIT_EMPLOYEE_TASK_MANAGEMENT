const Joi = require("joi");

const createGroupSchema = Joi.object({
  groupName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Group Name must be at least 2 characters",
    "string.max": "Group Name cannot exceed 100 characters",
    "any.required": "Group Name is required",
  }),
  description: Joi.string().optional().allow(""),
});

const updateGroupSchema = Joi.object({
  groupName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Group Name must be at least 2 characters",
    "string.max": "Group Name cannot exceed 100 characters",
    "any.required": "Group Name is required",
  }),
  description: Joi.string().optional().allow(""),
});

const updateGroupStatusSchema = Joi.object({
  status: Joi.boolean().required().messages({
    "any.required": "Status is required",
  }),
});

module.exports = {
  createGroupSchema,
  updateGroupSchema,
  updateGroupStatusSchema,
};
