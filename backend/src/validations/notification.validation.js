const Joi = require("joi");

const createNotificationSchema = Joi.object({
  userId: Joi.number().integer().min(1).required().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "number.min": "User ID must be a positive integer",
    "any.required": "User ID is required",
  }),
  title: Joi.string().min(2).max(100).required().messages({
    "string.min": "Title must be at least 2 characters",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),
  message: Joi.string().min(2).required().messages({
    "string.min": "Message must be at least 2 characters",
    "any.required": "Message is required",
  }),
});

module.exports = {
  createNotificationSchema,
};
