import api from "../utils/api";

const authService = {
  login: async (employeeId, password) => {
    const response = await api.post("/auth/login", { employeeId, password });
    if (response.success && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response;
  },

  changePassword: async (currentPassword, newPassword) => {
    return await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  getProfile: async () => {
    return await api.get("/users/profile");
  },

  updateProfile: async (profileData) => {
    return await api.put("/users/profile", profileData);
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },
};

export default authService;
