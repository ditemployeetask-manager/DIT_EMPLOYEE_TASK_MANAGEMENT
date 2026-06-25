const groupQuery = require("../queries/group.query");

const createGroup = async (groupData) => {
  return await groupQuery.createGroup(groupData);
};
const getAllGroups = async () => {
  return await groupQuery.getAllGroups();
};
const getGroupById = async (id) => {
  return await groupQuery.getGroupById(id);
};
const updateGroup = async (id, groupData) => {
  return await groupQuery.updateGroup(id, groupData);
};
const updateGroupStatus = async (id, status) => {
  return await groupQuery.updateGroupStatus(id, status);
};
module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  updateGroupStatus,
};
