import React, { useState } from 'react';
import '../components/Feed.css';

const Feed = () => {
  const [activeFilter, setActiveFilter] = useState('For you');

  // Sample recipe data - you would fetch this from your API
  const recipes = [
    {
      id: 1,
      title: 'Heart of Palm & Plantain Moqueca',
      image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500',
      difficulty: 'CREAMY',
      level: 'Level: 11/11',
      cookingTime: '30m',
      overallTime: '30m',
      servings: '6-8 servings',
      size: 'large'
    },
    {
      id: 2,
      title: 'Quick Tekuan',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      difficulty: 'NEW',
      cookingTime: '15m',
      size: 'medium'
    },
    {
      id: 3,
      title: 'Blue Cheese Dressing',
      image: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=400',
      difficulty: 'NEW',
      cookingTime: '13m',
      size: 'medium'
    },
    {
      id: 4,
      title: 'Roasted Lamb Shoulder & Boulangère Potato',
      image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
      difficulty: 'NEW',
      cookingTime: '3h+',
      size: 'medium'
    },
    {
      id: 5,
      title: 'Egg-Filled Pancake',
      image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400',
      difficulty: 'NEW',
      cookingTime: '2h+',
      size: 'medium'
    },
    {
      id: 6,
      title: 'Salmon Tartare',
      image: 'https://images.unsplash.com/photo-1580959375944-0e9b8e8d25b7?w=400',
      difficulty: 'NEW',
      cookingTime: '30m',
      size: 'small'
    },
    {
      id: 7,
      title: 'Panettoni',
      image: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=400',
      difficulty: 'NEW',
      cookingTime: '1d+',
      size: 'medium'
    },
    {
      id: 8,
      title: 'Grilled Cabbage, Seaweed & Ember Baked Strawberries',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      difficulty: 'NEW',
      cookingTime: '1h+',
      size: 'medium'
    },
    {
      id: 9,
      title: 'Frozen Margarita',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
      difficulty: 'NEW',
      cookingTime: '5m',
      size: 'small'
    }
  ];

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
    <div className="feed">
      {/* Search Bar */}
      <div className="feed__search-container">
        <div className="feed__search-wrapper">
          <svg className="feed__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input 
            type="text" 
            className="feed__search-input" 
            placeholder="What's cooking?"
          />
        </div>
        <button className="feed__filter-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="feed__filters">
        <div className="feed__filters-scroll">
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`feed__filter-pill ${activeFilter === filter ? 'feed__filter-pill--active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="feed__grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className={`feed__card feed__card--${recipe.size}`}>
            <div className="feed__card-image" style={{backgroundImage: `url(${recipe.image})`}}>
              {recipe.difficulty && (
                <span className="feed__card-badge">{recipe.difficulty}</span>
              )}
              <div className="feed__card-content">
                <h3 className="feed__card-title">{recipe.title}</h3>
                <div className="feed__card-meta">
                  {recipe.level && <span className="feed__card-level">{recipe.level}</span>}
                  {recipe.cookingTime && (
                    <div className="feed__card-info">
                      <span className="feed__card-label">Cooking</span>
                      <span className="feed__card-time">{recipe.cookingTime}</span>
                    </div>
                  )}
                  {recipe.overallTime && (
                    <div className="feed__card-info">
                      <span className="feed__card-label">Overall</span>
                      <span className="feed__card-time">{recipe.overallTime}</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="feed__card-info">
                      <span className="feed__card-label">Ready</span>
                      <span className="feed__card-time">{recipe.servings}</span>
                    </div>
                  )}
                  {!recipe.level && recipe.cookingTime && (
                    <>
                      <span className="feed__card-rating">★★★★</span>
                      <span className="feed__card-time">{recipe.cookingTime}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;