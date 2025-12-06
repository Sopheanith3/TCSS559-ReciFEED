/**
 * BLUESKY SERVICE
 * Centralized service for Bluesky cross-posting microservice.
 * Methods:
 * - checkAuth() - Check if user is authenticated with Bluesky
 * - authenticate(identifier, password) - Authenticate with Bluesky credentials
 * - createPost(text, images) - Post to Bluesky
 */

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};

// 1. API Configuration
// TODO: Replace with non-localhost kubernetes endpoint
const API_BASE = "http://localhost:3083";

// 2. API Service Object
export const bskyService = {

  // 3. Check if user is authenticated with Bluesky
  checkAuth: async () => {
    const response = await fetch(`${API_BASE}/validate`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { authorized: false };
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to check Bluesky authentication.");
    }

    return await response.json();
  },

  // 4. Authenticate with Bluesky using username and password
  authenticate: async (identifier, password) => {
    const response = await fetch(`${API_BASE}/auth`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ identifier, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to authenticate with Bluesky.");
    }

    return await response.json();
  },

  // 5. Post to Bluesky
  createPost: async (text, images = []) => {
    const formData = new FormData();
    formData.append('text', text);

    // Handle images - convert base64 to blobs if needed
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // If it's a base64 string, convert to blob
      if (image.startsWith('data:image')) {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append('images', blob, `image${i}.jpg`);
      } else if (image instanceof File || image instanceof Blob) {
        formData.append('images', image);
      }
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/post`, {
      method: "POST",
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` })
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to post to Bluesky.");
    }

    return await response.json();
  }
};
