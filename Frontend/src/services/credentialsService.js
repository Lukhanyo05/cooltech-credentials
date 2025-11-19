import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const credentialsService = {
  // Get all credentials for a division
  getCredentials: async (divisionId) => {
    const response = await api.get(`/credentials/division/${divisionId}`);
    return response.data;
  },

  // Add new credential
  addCredential: async (credentialData) => {
    const response = await api.post("/credentials", credentialData);
    return response.data;
  },

  // Update credential
  updateCredential: async (id, credentialData) => {
    const response = await api.put(`/credentials/${id}`, credentialData);
    return response.data;
  },

  // Delete credential
  deleteCredential: async (id) => {
    const response = await api.delete(`/credentials/${id}`);
    return response.data;
  },
};
