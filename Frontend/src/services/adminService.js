// frontend/src/services/adminService.js
import api from "../utils/api";

export const adminService = {
  // Get all users
  getUsers: async () => {
    try {
      console.log("🔧 adminService - Fetching users...");
      const response = await api.get("/admin/users");
      console.log(
        "🔧 adminService - Users fetched successfully, count:",
        response.data?.length || 0
      );
      return response.data;
    } catch (error) {
      console.error("🔧 adminService - Error fetching users:", error);
      throw error;
    }
  },

  // Change user role
  changeUserRole: async (userId, role) => {
    try {
      console.log(
        `🔧 adminService - Changing role for user ${userId} to ${role}`
      );
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      console.log("🔧 adminService - Role changed successfully");
      return response.data;
    } catch (error) {
      console.error("🔧 adminService - Error changing user role:", error);
      throw error;
    }
  },

  // Assign user to division
  assignUserToDivision: async (userId, divisionId) => {
    try {
      console.log(
        `🔧 adminService - Assigning user ${userId} to division ${divisionId}`
      );
      const response = await api.post(
        `/admin/users/${userId}/divisions/${divisionId}`
      );
      console.log("🔧 adminService - User assigned to division successfully");
      return response.data;
    } catch (error) {
      console.error(
        "🔧 adminService - Error assigning user to division:",
        error
      );
      throw error;
    }
  },

  // Unassign user from division
  unassignUserFromDivision: async (userId, divisionId) => {
    try {
      console.log(
        `🔧 adminService - Unassigning user ${userId} from division ${divisionId}`
      );
      const response = await api.delete(
        `/admin/users/${userId}/divisions/${divisionId}`
      );
      console.log(
        "🔧 adminService - User unassigned from division successfully"
      );
      return response.data;
    } catch (error) {
      console.error(
        "🔧 adminService - Error unassigning user from division:",
        error
      );
      throw error;
    }
  },

  // Assign user to OU
  assignUserToOU: async (userId, ouId) => {
    try {
      console.log(`🔧 adminService - Assigning user ${userId} to OU ${ouId}`);
      const response = await api.post(`/admin/users/${userId}/ous/${ouId}`);
      console.log("🔧 adminService - User assigned to OU successfully");
      return response.data;
    } catch (error) {
      console.error("🔧 adminService - Error assigning user to OU:", error);
      throw error;
    }
  },

  // Unassign user from OU
  unassignUserFromOU: async (userId, ouId) => {
    try {
      console.log(
        `🔧 adminService - Unassigning user ${userId} from OU ${ouId}`
      );
      const response = await api.delete(`/admin/users/${userId}/ous/${ouId}`);
      console.log("🔧 adminService - User unassigned from OU successfully");
      return response.data;
    } catch (error) {
      console.error("🔧 adminService - Error unassigning user from OU:", error);
      throw error;
    }
  },

  // Get all divisions
  getDivisions: async () => {
    try {
      console.log("🔧 adminService - Fetching divisions");
      const response = await api.get("/admin/divisions");
      console.log(
        "🔧 adminService - Divisions fetched successfully, count:",
        response.data?.length || 0
      );
      return response.data;
    } catch (error) {
      console.error("🔧 adminService - Error fetching divisions:", error);
      throw error;
    }
  },

  // Get all OUs
  getOUs: async () => {
    try {
      console.log("🔧 adminService - Fetching OUs");
      const response = await api.get("/admin/ous");
      console.log(
        "🔧 adminService - OUs fetched successfully, count:",
        response.data?.length || 0
      );
      return response.data;
    } catch (error) {
      console.error("🔧 adminService - Error fetching OUs:", error);
      throw error;
    }
  },
};
