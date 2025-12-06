/**
* ANALYTICS SERVICE
* Centralized service for user analytics microservice posts.
* Methods:
* - log(type, content)
* - getPopular(type, range)
* - getLive(type)
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
const API_BASE = "http://136.118.133.196";

// 2. API Service Object
export const analyticsService = {

  // 3. Log event endpoint
  log: async (type, content) => {
    const response = await fetch(`${API_BASE}/event`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, content })
    });

    if (!response.ok) {
      const error = await response.json();
      // Do not throw error, just log (analytics should not disrupt user flow)
      console.error(error.message || "Event log failed.");
    }
  },

  // 4. Get popular events endpoint
  getPopular: async (type, range) => {
    const response = await fetch(`${API_BASE}/popular?type=${type}&range=${range}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Popular analytics retieval failed.");
    }

    return await response.json();
  },
  

  // 5. Get live events endpoint
  getLive: async (type) => {
    const response = await fetch(`${API_BASE}/live?type=${type}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Live analytics point retrieval failed.");
    }

    const result = await response.json();
    if (typeof result.count !== 'number') {
      throw new Error(result.message || "Live analytics point retrieval failed.");
    }

    return result.count;
  },
};
