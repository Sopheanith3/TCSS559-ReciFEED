// 1. API Configuration
const API_URL = 'http://localhost:5050/api';

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

export const recipeService = {
  // Get all recipes with pagination and filters
  getAllRecipes: async (page = 1, limit = 20, sortBy = 'created_at', order = 'desc') => {
    try {
      const response = await fetch(
        `${API_URL}/recipes?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`,
        {
          headers: getAuthHeaders(),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  // Get a single recipe by ID
  getRecipeById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }
  },

  // Create a new recipe
  createRecipe: async (recipeData) => {
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(recipeData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create recipe');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  // Add a review to a recipe
  addReview: async (recipeId, rating, comment, userId, username) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${recipeId}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, comment, userId, username }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add review');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Delete a review from a recipe
  deleteReview: async (recipeId, reviewId) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${recipeId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
};
