import api from "../utils/api";

const reportService = {
  createReport: async (reportData, files = []) => {
    const formData = new FormData();
    // Append text fields
    Object.entries(reportData).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v);
    });
    // Append files
    files.forEach((file) => formData.append("attachments", file));
    return await api.post("/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getMyReports: async (page = 1, limit = 10, status = "", reportDate = "", startDate = "", endDate = "") => {
    const params = { page: page.toString(), limit: limit.toString() };
    if (status) params.status = status;
    if (reportDate) params.reportDate = reportDate;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const queryParams = new URLSearchParams(params).toString();
    return await api.get(`/reports/my-reports?${queryParams}`);
  },

  getTeamReports: async (
    page = 1,
    limit = 10,
    search = "",
    status = "",
    reportDate = ""
  ) => {
    const params = { page: page.toString(), limit: limit.toString() };
    if (search) params.search = search;
    if (status) params.status = status;
    if (reportDate) params.reportDate = reportDate;

    const queryParams = new URLSearchParams(params).toString();
    return await api.get(`/reports/team?${queryParams}`);
  },

  reviewReport: async (id, status, adminRemarks = "") => {
    return await api.put(`/reports/${id}/review`, { status, adminRemarks });
  },

  updateReport: async (id, reportData, newFiles = [], existingAttachments = []) => {
    const formData = new FormData();
    Object.entries(reportData).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v);
    });
    formData.append("existingAttachments", JSON.stringify(existingAttachments));
    newFiles.forEach((file) => formData.append("attachments", file));
    return await api.put(`/reports/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getReportById: async (id) => {
    return await api.get(`/reports/${id}`);
  },

  deleteReport: async (id) => {
    return await api.delete(`/reports/${id}`);
  },

  exportReports: async () => {
    const blob = await api.get("/reports/export");
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reports_${new Date().toISOString().split("T")[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default reportService;
