/**
 * TWITTER SERVICE
 * Centralized service for Twitter cross-posting microservice.
 * Methods:
 * - checkAuth() - Check if user is authenticated with Twitter
 * - startAuth() - Start Twitter OAuth flow
 * - completeAuth(pin) - Complete Twitter OAuth with PIN
 * - createPost(text, images) - Post to Twitter
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
const API_BASE = "http://recifeed.example.com/twitter";

// 2. API Service Object
export const twitterService = {

  // 3. Check if user is authenticated with Twitter
  checkAuth: async () => {
    const response = await fetch(`${API_BASE}/auth`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { authorized: false };
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to check Twitter authentication.");
    }

    return await response.json();
  },

  // 4. Start Twitter OAuth flow
  startAuth: async () => {
    const response = await fetch(`${API_BASE}/auth/start`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start Twitter authentication.");
    }

    return await response.json();
  },

  // 5. Complete Twitter OAuth with PIN
  completeAuth: async (pin) => {
    const response = await fetch(`${API_BASE}/auth/complete`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ pin })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to complete Twitter authentication.");
    }

    return await response.json();
  },

  // 6. Post to Twitter
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
      throw new Error(error.error || "Failed to post to Twitter.");
    }

    return await response.json();
  }
};
