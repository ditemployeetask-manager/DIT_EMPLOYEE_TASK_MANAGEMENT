import api from "../utils/api";

const employeeService = {
  createEmployee: async (employeeData) => {
    return await api.post("/users/employees", employeeData);
  },

  getAllEmployees: async (page = 1, limit = 10, search = "") => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    }).toString();
    return await api.get(`/users/employees?${queryParams}`);
  },

  getEmployeeById: async (id) => {
    return await api.get(`/users/employees/${id}`);
  },

  updateEmployee: async (id, employeeData) => {
    return await api.put(`/users/employees/${id}`, employeeData);
  },

  resetPassword: async (id) => {
    return await api.put(`/users/${id}/reset-password`);
  },
};

export default employeeService;
