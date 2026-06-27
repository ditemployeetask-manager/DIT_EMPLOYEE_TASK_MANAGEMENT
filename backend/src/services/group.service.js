const groupQuery = require("../queries/group.query");
const createAuditLog = require("../utils/createAuditLog");

const createGroup = async (groupData, createdBy) => {
  const existingGroup = await groupQuery.getGroupByName(groupData.groupName);

  if (existingGroup) {
    throw new Error("Group name already exists");
  }
  const group = await groupQuery.createGroup(groupData);

  await createAuditLog(
    createdBy,
    "CREATE_GROUP",
    "GROUP",
    group.id,
    `Created group ${group.group_name}`,
  );

  return group;
};
const getAllGroups = async () => {
  return await groupQuery.getAllGroups();
};
const getGroupById = async (id) => {
  return await groupQuery.getGroupById(id);
};
const updateGroup = async (id, groupData, updatedBy) => {
  const group = await groupQuery.updateGroup(id, groupData);

  await createAuditLog(
    updatedBy,
    "UPDATE_GROUP",
    "GROUP",
    group.id,
    `Updated group ${group.group_name}`,
  );

  return group;
};
const updateGroupStatus = async (id, status, updatedBy) => {
  const group = await groupQuery.updateGroupStatus(id, status);

  await createAuditLog(
    updatedBy,
    "UPDATE_GROUP_STATUS",
    "GROUP",
    group.id,
    `Changed group ${group.group_name} status to ${status}`,
  );

  return group;
};
module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  updateGroupStatus,
};
