import React, { useState, useEffect } from 'react';
import '../components/Recipe.css';
import RecipeModal from '../layout/RecipeModal';
import { recipeService } from '../services/recipeService';

const Recipe = () => {
  const [activeFilter, setActiveFilter] = useState('For you');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recipes from backend
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeService.getAllRecipes(1, 50);
      
      if (response.status === 'success') {
        // Transform backend data to match frontend structure
        const transformedRecipes = response.data.recipes.map((recipe, index) => ({
          id: recipe._id,
          title: recipe.title,
          image: recipe.image_urls && recipe.image_urls.length > 0 
            ? recipe.image_urls[0] 
            : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          cookingTime: recipe.cooking_time || '0 mins',
          servings: recipe.servings,
          level: recipe.difficulty_level,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          tags: recipe.tags,
          likes: recipe.likes,
          comments: recipe.comments,
          username: recipe.username,
          created_at: recipe.created_at,
          // Assign random sizes for masonry layout
          size: index % 7 === 0 ? 'large' : index % 3 === 0 ? 'small' : 'medium'
        }));
        
        setRecipes(transformedRecipes);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const handleCloseModal = () => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  };

  const filters = [
    'For you',
    'Quick',
    '1h or less',
    'Few ingredients',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Dessert',
    'Cocktails',
    'Vegan',
    'Vegetarian',
    'Plant-forward'
  ];
  
  return (
    <div className="recipe">
      <RecipeModal isOpen={showRecipeModal} onClose={handleCloseModal} recipe={selectedRecipe} />
      {/* Search Bar */}
      <div className="recipe__search-container">
        <div className="recipe__search-wrapper">
          <svg className="recipe__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input 
            type="text" 
            className="recipe__search-input" 
            placeholder="What's cooking?"
          />
        </div>
        <button className="recipe__filter-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="recipe__filters">
        <div className="recipe__filters-scroll">
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`recipe__filter-pill ${activeFilter === filter ? 'recipe__filter-pill--active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
          <p>Loading recipes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
          <p>{error}</p>
          <button 
            onClick={fetchRecipes}
            style={{ 
              marginTop: '16px', 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer' 
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Recipe Grid */}
      {!loading && !error && (
        <div className="recipe__grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className={`recipe__card recipe__card--${recipe.size}`} onClick={() => handleRecipeClick(recipe)}>
              <div className="recipe__card-image" style={{backgroundImage: `url(${recipe.image})`}}>
                {recipe.difficulty && (
                  <span className="recipe__card-badge">{recipe.difficulty}</span>
                )}
                <div className="recipe__card-content">
                  <h3 className="recipe__card-title">{recipe.title}</h3>
                  <div className="recipe__card-meta">
                    {recipe.level && <span className="recipe__card-level">{recipe.level}</span>}
                    {recipe.cookingTime && (
                      <div className="recipe__card-info">
                        <span className="recipe__card-label">Cooking</span>
                        <span className="recipe__card-time">{recipe.cookingTime}</span>
                      </div>
                    )}
                    {recipe.overallTime && (
                      <div className="recipe__card-info">
                        <span className="recipe__card-label">Overall</span>
                        <span className="recipe__card-time">{recipe.overallTime}</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="recipe__card-info">
                        <span className="recipe__card-label">Servings</span>
                        <span className="recipe__card-time">{recipe.servings}</span>
                      </div>
                    )}
                    {!recipe.level && recipe.cookingTime && (
                      <>
                        <span className="recipe__card-rating">★★★★</span>
                        <span className="recipe__card-time">{recipe.cookingTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recipe;