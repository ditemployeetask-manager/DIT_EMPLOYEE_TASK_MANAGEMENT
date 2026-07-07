import api from "../utils/api";

const groupService = {
  createGroup: async (groupData) => {
    return await api.post("/groups", groupData);
  },

  getAllGroups: async () => {
    return await api.get("/groups");
  },

  getGroupById: async (id) => {
    return await api.get(`/groups/${id}`);
  },

  updateGroup: async (id, groupData) => {
    return await api.put(`/groups/${id}`, groupData);
  },

  updateGroupStatus: async (id, status) => {
    return await api.patch(`/groups/${id}/status`, { status });
  },
};

export default groupService;
