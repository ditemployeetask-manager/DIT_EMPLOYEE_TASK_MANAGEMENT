const express = require("express");
const router = express.Router();

const groupController = require("../controllers/group.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/", verifyToken, authorizeRoles(1), groupController.createGroup);
router.get(
  "/",
  verifyToken,
  authorizeRoles(1, 2),
  groupController.getAllGroups,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles(1, 2),
  groupController.getGroupById,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles(1),
  groupController.updateGroup
);
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles(1),
  groupController.updateGroupStatus,
);

module.exports = router;
