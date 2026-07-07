import api from "../utils/api";

const adminService = {
  createAdmin: async (adminData) => {
    return await api.post("/users/admins", adminData);
  },

  getAllAdmins: async (page = 1, limit = 10, search = "") => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    }).toString();
    return await api.get(`/users/admins?${queryParams}`);
  },

  getAdminById: async (id) => {
    return await api.get(`/users/admins/${id}`);
  },

  updateAdmin: async (id, adminData) => {
    return await api.put(`/users/admins/${id}`, adminData);
  },

  assignAdminGroup: async (id, groupIds) => {
    return await api.put(`/users/admins/${id}/group`, { groupIds });
  },

  updateAdminStatus: async (id, status) => {
    return await api.patch(`/users/admins/${id}/status`, { status });
  },
};

export default adminService;
