const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");

const verifyToken = require("../middleware/auth.middleware");

const authorizeRoles = require("../middleware/role.middleware");

router.post("/", verifyToken, authorizeRoles(3), reportController.createReport);
router.get(
  "/my-reports",
  verifyToken,
  authorizeRoles(3),
  reportController.getMyReports,
);
router.get(
  "/team",
  verifyToken,
  authorizeRoles(1, 2),
  reportController.getTeamReports,
);
router.put(
  "/:id/review",
  verifyToken,
  authorizeRoles(1, 2),
  reportController.reviewReport,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles(3),
  reportController.updateReport,
);

module.exports = router;
