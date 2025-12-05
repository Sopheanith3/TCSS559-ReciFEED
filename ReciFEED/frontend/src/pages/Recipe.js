import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Recipe.css';
import RecipeModal from '../layout/RecipeModal';
import CreateRecipeModal from '../layout/CreateRecipeModal';
import EditRecipeModal from '../layout/EditRecipeModal';
import FilterModal from '../layout/FilterModal';
import { recipeService } from '../services/recipeService';
import { searchService } from '../services/searchService';
import { useAuth } from '../context/AuthContext';

const Recipe = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableCookingTimes, setAvailableCookingTimes] = useState([]);
  const [activeFilters, setActiveFilters] = useState({ tags: [], cookingTime: '' });

  // Fetch recipes from backend
  useEffect(() => {
    fetchRecipes();
    fetchFilterOptions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate('/');
    }, 0);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          image_urls: recipe.image_urls || [], // Preserve original array for editing
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
      const response = await searchService.searchRecipes(query);
      
      if (response.status === 'success') {
        // Transform search results to match frontend structure
        const transformedRecipes = response.data.recipes.map((recipe, index) => ({
          id: recipe._id,
          title: recipe.title,
          image: recipe.image_urls && recipe.image_urls.length > 0 
            ? recipe.image_urls[0] 
            : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          image_urls: recipe.image_urls || [], // Preserve original array for editing
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

  const handleRecipeCreated = () => {
    // Refresh recipes after creating a new one
    fetchRecipes();
  };

  const handleEditRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(false);
    setShowEditModal(true);
  };

  const handleRecipeUpdated = () => {
    // Refresh recipes after updating
    fetchRecipes();
    setShowEditModal(false);
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await searchService.getFilterOptions();
      if (response.status === 'success') {
        setAvailableTags(response.data.tags || []);
        setAvailableCookingTimes(response.data.cookingTimes || []);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const handleApplyFilters = async (filters) => {
    setActiveFilters(filters);
    
    // If no filters are active, show all recipes
    if (filters.tags.length === 0 && !filters.cookingTime) {
      setFilteredRecipes(recipes);
      return;
    }

    // Apply filters
    try {
      setIsSearching(true);
      const response = await searchService.filterRecipes(filters);
      
      if (response.status === 'success') {
        const transformedRecipes = response.data.recipes.map((recipe, index) => ({
          id: recipe._id,
          title: recipe.title,
          image: recipe.image_urls && recipe.image_urls.length > 0 
            ? recipe.image_urls[0] 
            : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          image_urls: recipe.image_urls || [],
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
      console.error('Error filtering recipes:', err);
      setFilteredRecipes(recipes);
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="recipe">
      <RecipeModal 
        isOpen={showRecipeModal} 
        onClose={handleCloseModal} 
        recipe={selectedRecipe}
        onReviewAdded={handleReviewAdded}
        onEditRecipe={handleEditRecipe}
      />
      <CreateRecipeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRecipeCreated={handleRecipeCreated}
      />
      <EditRecipeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onRecipeUpdated={handleRecipeUpdated}
        recipe={selectedRecipe}
      />
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
        availableTags={availableTags}
        availableCookingTimes={availableCookingTimes}
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

        {/* Filter Button */}
        <button 
          className="recipe__filter-btn"
          style={{ 
            background: (activeFilters.tags.length > 0 || activeFilters.cookingTime) 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '10px 12px', 
            borderRadius: '10px', 
            marginLeft: '12px',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onClick={() => setShowFilterModal(true)}
          aria-label="Filter"
          onMouseEnter={(e) => {
            if (!(activeFilters.tags.length > 0 || activeFilters.cookingTime)) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }
          }}
          onMouseLeave={(e) => {
            if (!(activeFilters.tags.length > 0 || activeFilters.cookingTime)) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="8" cy="6" r="2" fill="#fff"/>
            <circle cx="16" cy="12" r="2" fill="#fff"/>
            <circle cx="12" cy="18" r="2" fill="#fff"/>
          </svg>
          {(activeFilters.tags.length > 0 || activeFilters.cookingTime) && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: '#ff4458',
              color: '#fff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: '2px solid #16213e'
            }}>
              {activeFilters.tags.length + (activeFilters.cookingTime ? 1 : 0)}
            </span>
          )}
        </button>
        
        {/* Right side: Create Recipe Icon + User Profile Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
          {/* Create Recipe Icon */}
          <button 
            className="recipe__create-icon-btn"
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '8px', 
              borderRadius: '8px', 
              transition: 'background 0.2s ease' 
            }}
            onClick={() => setShowCreateModal(true)}
            aria-label="Create Recipe"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          {/* User Profile Icon with Dropdown */}
          <div ref={profileDropdownRef} style={{ position: 'relative' }}>
            <button 
              className="recipe__profile-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              aria-label="Profile"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '1rem' }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>
            
            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                backgroundColor: '#1a1a2e',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                minWidth: '200px',
                overflow: 'hidden',
                zIndex: 1000,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <p style={{ margin: 0, color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>
                    {user?.username || 'User'}
                  </p>
                  <p style={{ margin: '4px 0 0', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
                    @{user?.username?.toLowerCase() || 'user'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
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