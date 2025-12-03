const API_URL = 'http://localhost:5050/api';

export const recipeService = {
  // Get all recipes with pagination and filters
  getAllRecipes: async (page = 1, limit = 20, sortBy = 'created_at', order = 'desc') => {
    try {
      const response = await fetch(
        `${API_URL}/recipes?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`
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
      const response = await fetch(`${API_URL}/recipes/${id}`);
      
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
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Like a recipe
  likeRecipe: async (recipeId, userId, username) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${recipeId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, username }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to like recipe');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error liking recipe:', error);
      throw error;
    }
  },

  // Unlike a recipe
  unlikeRecipe: async (recipeId, userId) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${recipeId}/likes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to unlike recipe');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error unliking recipe:', error);
      throw error;
    }
  },

  // Add a comment to a recipe
  addComment: async (recipeId, content, userId, username) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, userId, username }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
};
