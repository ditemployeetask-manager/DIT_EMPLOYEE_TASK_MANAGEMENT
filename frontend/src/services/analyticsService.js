import api from "../utils/api";

const analyticsService = {
  getEmployeeDashboard: async () => {
    return await api.get("/dashboard/employee");
  },

  getAdminDashboard: async () => {
    return await api.get("/dashboard/admin");
  },

  getSuperAdminDashboard: async () => {
    return await api.get("/dashboard/super-admin");
  },
};

export default analyticsService;
