const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const upload = require("../middlewares/upload.middleware");
const { idParamSchema } = require("../validations/user.validation");
const {
  createReportSchema,
  updateReportSchema,
  reviewReportSchema,
  queryReportsSchema,
  teamReportsQuerySchema,
} = require("../validations/report.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles(3),
  (req, res, next) => upload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  }),
  validate(createReportSchema),
  reportController.createReport
);
router.get(
  "/my-reports",
  verifyToken,
  authorizeRoles(3),
  validate(queryReportsSchema, "query"),
  reportController.getMyReports,
);
router.get(
  "/team",
  verifyToken,
  authorizeRoles(1, 2),
  validate(teamReportsQuerySchema, "query"),
  reportController.getTeamReports,
);
router.put(
  "/:id/review",
  verifyToken,
  authorizeRoles(1, 2),
  validate(idParamSchema, "params"),
  validate(reviewReportSchema),
  reportController.reviewReport,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles(3),
  validate(idParamSchema, "params"),
  (req, res, next) => upload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  }),
  validate(updateReportSchema),
  reportController.updateReport
);
router.get(
  "/export",
  verifyToken,
  authorizeRoles(1, 2),
  reportController.exportAllReports,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles(1, 2, 3),
  validate(idParamSchema, "params"),
  reportController.getReportById,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(3),
  validate(idParamSchema, "params"),
  reportController.deleteReport,
);

module.exports = router;
