const groupService = require("../services/group.service");

const createGroup = async (req, res) => {
  try {
    const group = await groupService.createGroup(req.body);

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllGroups = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups();

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getGroupById = async (req, res) => {
  try {
    const group = await groupService.getGroupById(req.params.id);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateGroup = async (req, res) => {
  try {
    const group = await groupService.updateGroup(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const updateGroupStatus = async (req, res) => {
  try {
    const group = await groupService.updateGroupStatus(
      req.params.id,
      req.body.status,
    );

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  updateGroupStatus,
};
