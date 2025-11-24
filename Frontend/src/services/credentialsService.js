// frontend/src/services/credentialsService.js
import api from "../utils/api";

export const credentialsService = {
  // Get all credentials for user's divisions
  getMyCredentials: async () => {
    try {
      console.log("🔧 Fetching user credentials...");
      const response = await api.get("/credentials/my-credentials");
      console.log("✅ Credentials fetched successfully:", response.data.length);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching credentials:", error);
      throw error;
    }
  },

  // Get credentials for a specific division
  getDivisionCredentials: async (divisionId) => {
    try {
      console.log(`🔧 Fetching credentials for division ${divisionId}`);
      const response = await api.get(`/credentials/division/${divisionId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching division credentials:", error);
      throw error;
    }
  },

  // Create new credential
  createCredential: async (credentialData) => {
    try {
      console.log("🔧 Creating new credential:", credentialData);
      const response = await api.post("/credentials", credentialData);
      console.log("✅ Credential created successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Error creating credential:", error);
      throw error;
    }
  },

  // Update credential
  updateCredential: async (credentialId, updates) => {
    try {
      console.log(`🔧 Updating credential ${credentialId}:`, updates);
      const response = await api.put(`/credentials/${credentialId}`, updates);
      console.log("✅ Credential updated successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Error updating credential:", error);
      throw error;
    }
  },

  // Delete credential
  deleteCredential: async (credentialId) => {
    try {
      console.log(`🔧 Deleting credential ${credentialId}`);
      const response = await api.delete(`/credentials/${credentialId}`);
      console.log("✅ Credential deleted successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting credential:", error);
      throw error;
    }
  },
};
