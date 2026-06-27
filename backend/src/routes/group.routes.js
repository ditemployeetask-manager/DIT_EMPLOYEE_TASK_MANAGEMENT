const express = require("express");
const router = express.Router();

const groupController = require("../controllers/group.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { idParamSchema } = require("../validations/user.validation");
const {
  createGroupSchema,
  updateGroupSchema,
  updateGroupStatusSchema,
} = require("../validations/group.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles(1),
  validate(createGroupSchema),
  groupController.createGroup
);
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
  validate(idParamSchema, "params"),
  groupController.getGroupById,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles(1),
  validate(idParamSchema, "params"),
  validate(updateGroupSchema),
  groupController.updateGroup
);
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles(1),
  validate(idParamSchema, "params"),
  validate(updateGroupStatusSchema),
  groupController.updateGroupStatus,
);

module.exports = router;
