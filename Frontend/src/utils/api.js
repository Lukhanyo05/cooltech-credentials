const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = {
  // Auth endpoints
  login: (credentials) =>
    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }).then(handleResponse),

  // Credential endpoints
  getCredentials: (token) =>
    fetch(`${API_URL}/credentials`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handleResponse),

  createCredential: (credential, token) =>
    fetch(`${API_URL}/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(credential),
    }).then(handleResponse),

  updateCredential: (id, credential, token) =>
    fetch(`${API_URL}/credentials/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(credential),
    }).then(handleResponse),

  // Admin endpoints
  getUsers: (token) =>
    fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handleResponse),

  updateUser: (id, userData, token) =>
    fetch(`${API_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    }).then(handleResponse),
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

export default api;
