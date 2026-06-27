const Joi = require("joi");

const createReportSchema = Joi.object({
  workDone: Joi.string().min(5).required().messages({
    "string.min": "Work Done description must be at least 5 characters long",
    "any.required": "Work Done description is required",
  }),
  tomorrowPlan: Joi.string().optional().allow(""),
  reportDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Report Date must be in YYYY-MM-DD format",
      "any.required": "Report Date is required",
    }),
});

const updateReportSchema = Joi.object({
  workDone: Joi.string().min(5).required().messages({
    "string.min": "Work Done description must be at least 5 characters long",
    "any.required": "Work Done description is required",
  }),
  tomorrowPlan: Joi.string().optional().allow(""),
});

const reviewReportSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required().messages({
    "any.only": "Status must be either APPROVED or REJECTED",
    "any.required": "Status is required",
  }),
  adminRemarks: Joi.string().optional().allow(""),
});

const queryReportsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").optional().allow(""),
  reportDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .allow(""),
});

const teamReportsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(""),
  status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").optional().allow(""),
  reportDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .allow(""),
});

module.exports = {
  createReportSchema,
  updateReportSchema,
  reviewReportSchema,
  queryReportsSchema,
  teamReportsQuerySchema,
};
