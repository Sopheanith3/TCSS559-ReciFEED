/**
* AUTH SERVICE
* Centralized service for user auth backend API calls.
* Methods:
* - login(email, password): User authentication
* - validateToken(token): Verify token validity
*/

// 1. API Configuration
// TODO: Replace with non-localhost kubernetes endpoint?
const API_BASE = "http://127.0.0.1:54014/api";

// 2. API Service Object
export const authService = {

  // 3. Login endpoint
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }
    
    return response.json();
  },

  // 4. Create account endpoint
  register: async (email, password, username) => {
    const response = await fetch(`${API_BASE}/users/`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, username })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },
  

  // 5. Token validation endpoint
  validateToken: async (token) => {
    const response = await fetch(`${API_BASE}/users/validate`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.json();
  },
};
