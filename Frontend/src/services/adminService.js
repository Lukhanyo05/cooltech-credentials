import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token being sent:", token.substring(0, 20) + "..."); // Debug log
  } else {
    console.warn("No token found in localStorage");
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      console.log("401 Unauthorized - redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  // Get all users
  getUsers: async () => {
    try {
      console.log("Fetching users from:", `${API_URL}/users`);
      const response = await api.get("/users");
      console.log("Users fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Change user role
  changeUserRole: async (userId, role) => {
    try {
      console.log(`Changing role for user ${userId} to ${role}`);
      const response = await api.put(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error("Error changing user role:", error);
      throw error;
    }
  },

  // Assign user to division
  assignUserToDivision: async (userId, divisionId) => {
    try {
      console.log(`Assigning user ${userId} to division ${divisionId}`);
      const response = await api.post(
        `/users/${userId}/divisions/${divisionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning user to division:", error);
      throw error;
    }
  },

  // Unassign user from division
  unassignUserFromDivision: async (userId, divisionId) => {
    try {
      console.log(`Unassigning user ${userId} from division ${divisionId}`);
      const response = await api.delete(
        `/users/${userId}/divisions/${divisionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error unassigning user from division:", error);
      throw error;
    }
  },

  // Assign user to OU
  assignUserToOU: async (userId, ouId) => {
    try {
      console.log(`Assigning user ${userId} to OU ${ouId}`);
      const response = await api.post(`/users/${userId}/ous/${ouId}`);
      return response.data;
    } catch (error) {
      console.error("Error assigning user to OU:", error);
      throw error;
    }
  },

  // Unassign user from OU
  unassignUserFromOU: async (userId, ouId) => {
    try {
      console.log(`Unassigning user ${userId} from OU ${ouId}`);
      const response = await api.delete(`/users/${userId}/ous/${ouId}`);
      return response.data;
    } catch (error) {
      console.error("Error unassigning user from OU:", error);
      throw error;
    }
  },

  // Get all divisions
  getDivisions: async () => {
    try {
      console.log("Fetching divisions");
      const response = await api.get("/divisions");
      return response.data;
    } catch (error) {
      console.error("Error fetching divisions:", error);
      throw error;
    }
  },

  // Get all OUs
  getOUs: async () => {
    try {
      console.log("Fetching OUs");
      const response = await api.get("/ous");
      return response.data;
    } catch (error) {
      console.error("Error fetching OUs:", error);
      throw error;
    }
  },
};
