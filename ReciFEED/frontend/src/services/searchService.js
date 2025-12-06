// API Configuration
const API_URL = 'http://127.0.0.1:54014/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const searchService = {
  // Search recipes by query and optional tags
  searchRecipes: async (query, tags = null) => {
    try {
      let url = `${API_URL}/search/recipes?q=${encodeURIComponent(query)}`;
      
      if (tags && tags.length > 0) {
        url += `&tags=${tags.join(',')}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to search recipes');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  },

  // Get available filter options from backend
  getFilterOptions: async () => {
    try {
      const response = await fetch(`${API_URL}/recipes/filters/options`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  },

  // Filter recipes by tags and cooking time
  filterRecipes: async (filters) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      
      if (filters.cookingTime) {
        params.append('cooking_time', filters.cookingTime);
      }
      
      const response = await fetch(`${API_URL}/recipes/filter?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to filter recipes');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error filtering recipes:', error);
      throw error;
    }
  },
};
