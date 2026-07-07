import api from "../utils/api";

const auditService = {
  getAllAuditLogs: async () => {
    return await api.get("/audit-logs");
  },
  getAuditLogById: async (id) => {
    return await api.get(`/audit-logs/${id}`);
  }
};

export default auditService;
