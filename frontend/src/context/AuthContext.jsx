import React, { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  
    const savedToken = authService.getToken();
    const savedUser = authService.getCurrentUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      if (savedUser.user) {
        
        setUser(savedUser.user);
        localStorage.setItem("user", JSON.stringify(savedUser.user));
      } else {
        setUser(savedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (employeeId, password) => {
    setLoading(true);
    try {
      const response = await authService.login(employeeId, password);
      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.message || "Login failed" };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      if (response.success) {
        const savedUserStr = localStorage.getItem("user");
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          savedUser.must_change_password = false;
          localStorage.setItem("user", JSON.stringify(savedUser));
          setUser(savedUser);
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
