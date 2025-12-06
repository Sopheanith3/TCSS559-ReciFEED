/**
 * RECIPE SERVICE
 * Centralized service for recipe querying from the monolith.
 */

// 1. API Configuration
const API_URL = 'http://recifeed.example.com/api';

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

  // Create a new recipe with file uploads
  createRecipe: async (recipeData) => {
    try {
      const formData = new FormData();
      
      // Add all recipe fields
      formData.append('title', recipeData.title);
      formData.append('cooking_time', recipeData.cooking_time || '');
      
      // Add tags as JSON string
      if (Array.isArray(recipeData.tags)) {
        formData.append('tags', JSON.stringify(recipeData.tags));
      }
      
      // Add ingredients as JSON string
      if (Array.isArray(recipeData.ingredients)) {
        formData.append('ingredients', JSON.stringify(recipeData.ingredients));
      }
      
      // Add instructions as JSON string
      if (Array.isArray(recipeData.instructions)) {
        formData.append('instructions', JSON.stringify(recipeData.instructions));
      }
      
      formData.append('userId', recipeData.userId);
      formData.append('username', recipeData.username);
      
      // Add image files
      if (Array.isArray(recipeData.images) && recipeData.images.length > 0) {
        recipeData.images.forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }
      
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: headers,
        body: formData,
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

  // Update an existing recipe with file uploads
  updateRecipe: async (recipeId, recipeData) => {
    try {
      const formData = new FormData();
      
      // Add recipe fields
      if (recipeData.title) formData.append('title', recipeData.title);
      if (recipeData.cooking_time !== undefined) formData.append('cooking_time', recipeData.cooking_time);
      
      // Add tags as JSON string
      if (Array.isArray(recipeData.tags)) {
        formData.append('tags', JSON.stringify(recipeData.tags));
      }
      
      // Add ingredients as JSON string
      if (Array.isArray(recipeData.ingredients)) {
        formData.append('ingredients', JSON.stringify(recipeData.ingredients));
      }
      
      // Add instructions as JSON string
      if (Array.isArray(recipeData.instructions)) {
        formData.append('instructions', JSON.stringify(recipeData.instructions));
      }
      
      // Add image files
      if (Array.isArray(recipeData.images) && recipeData.images.length > 0) {
        recipeData.images.forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }
      
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
        method: 'PUT',
        headers: headers,
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  // Delete a recipe
  deleteRecipe: async (recipeId) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting recipe:', error);
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add review');
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete review');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
};
