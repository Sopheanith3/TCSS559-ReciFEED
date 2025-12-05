import React, { useState, useEffect } from 'react';
import '../components/Recipe.css';
import RecipeModal from '../layout/RecipeModal';
import { recipeService } from '../services/recipeService';

const Recipe = () => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch recipes from backend
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecipes(recipes);
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
          reviews: recipe.reviews || [],
          averageRating: recipe.reviews && recipe.reviews.length > 0
            ? recipe.reviews.reduce((acc, r) => acc + r.rating, 0) / recipe.reviews.length
            : 0,
          totalReviews: recipe.reviews ? recipe.reviews.length : 0,
          username: recipe.username,
          created_at: recipe.created_at,
          // Assign random sizes for masonry layout
          size: index % 7 === 0 ? 'large' : index % 3 === 0 ? 'small' : 'medium'
        }));
        
        setRecipes(transformedRecipes);
        setFilteredRecipes(transformedRecipes);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      setIsSearching(true);
      const response = await recipeService.searchRecipes(query);
      
      if (response.status === 'success') {
        // Transform search results to match frontend structure
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
          reviews: recipe.reviews || [],
          averageRating: recipe.reviews && recipe.reviews.length > 0
            ? recipe.reviews.reduce((acc, r) => acc + r.rating, 0) / recipe.reviews.length
            : 0,
          totalReviews: recipe.reviews ? recipe.reviews.length : 0,
          username: recipe.username,
          created_at: recipe.created_at,
          size: index % 7 === 0 ? 'large' : index % 3 === 0 ? 'small' : 'medium'
        }));
        
        setFilteredRecipes(transformedRecipes);
      }
    } catch (err) {
      console.error('Error searching recipes:', err);
      // On error, fall back to showing all recipes
      setFilteredRecipes(recipes);
    } finally {
      setIsSearching(false);
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

  const handleReviewAdded = () => {
    // Refresh recipes to show updated reviews
    fetchRecipes();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setFilteredRecipes(recipes);
  };
  
  return (
    <div className="recipe">
      <RecipeModal 
        isOpen={showRecipeModal} 
        onClose={handleCloseModal} 
        recipe={selectedRecipe}
        onReviewAdded={handleReviewAdded}
      />
      {/* Page Title and Search Bar on Same Line */}
      <div className="recipe__search-container">
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#fff',
          margin: 0,
          letterSpacing: '1px',
          fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
          marginRight: '20px',
          flexShrink: 0
        }}>Recipe</h1>
        <div className="recipe__search-wrapper">
          <svg className="recipe__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input 
            type="text" 
            className="recipe__search-input" 
            placeholder="Search recipes, ingredients, or tags..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button 
              className="recipe__search-clear"
              onClick={handleSearchClear}
              style={{
                position: 'absolute',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {(loading || isSearching) && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
          <p>{isSearching ? 'Searching recipes...' : 'Loading recipes...'}</p>
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
      {!loading && !isSearching && !error && (
        <>
          {filteredRecipes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.6)' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 20px', opacity: 0.3 }}>
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No recipes found</p>
              <p style={{ fontSize: '0.95rem', opacity: 0.7 }}>
                Try searching for something else or clear your search
              </p>
            </div>
          ) : (
            <div className="recipe__grid">
              {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className={`recipe__card recipe__card--${recipe.size}`} onClick={() => handleRecipeClick(recipe)}>
              <div className="recipe__card-image" style={{backgroundImage: `url(${recipe.image})`}}>
                {/* Difficulty badge (top left) */}
                {recipe.difficulty && (
                  <span className="recipe__card-badge">{recipe.difficulty}</span>
                )}
                {/* Tags (top right) */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="recipe__card-tags">
                    <span className="recipe__card-tag">
                      {recipe.tags.join(', ')}
                    </span>
                  </div>
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
                    {!recipe.level && recipe.cookingTime && recipe.totalReviews > 0 && (
                      <>
                        <span className="recipe__card-rating">
                          {'★'.repeat(Math.round(recipe.averageRating)) + '☆'.repeat(5 - Math.round(recipe.averageRating))}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          ({recipe.totalReviews})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Recipe;