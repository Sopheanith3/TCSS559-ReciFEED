/**
 * RECIPE QUERY SERVICE
 * Centralized service for recipe question-answering using LLM microservice.
 * Methods:
 * - askQuestion(recipe, query)
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
export const recipeQueryService = {

  // 3. Ask question about a recipe
  askQuestion: async (recipe, query) => {
    // Format recipe data as a string
    const recipeText = `
Title: ${recipe.title}

Ingredients:
${recipe.ingredients.map(ing => `- ${ing}`).join('\n')}

Instructions:
${recipe.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

Cooking Time: ${recipe.cookingTime}
Servings: ${recipe.servings}
Difficulty Level: ${recipe.level}
${recipe.tags && recipe.tags.length > 0 ? `Tags: ${recipe.tags.join(', ')}` : ''}
    `.trim();

    const response = await fetch(`${API_BASE}/query`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        recipe: recipeText, 
        query: query 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get answer from recipe assistant.");
    }

    return await response.json();
  }
};
