import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Mock data - will be replaced with actual API call
  const mockRecipes = [
    {
      id: 1,
      title: 'Spicy Chicken Wings',
      image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',
      author: { name: 'Gordon Ramsay' },
      rating: 4.5,
      prepTime: 45,
      difficulty: 'Medium',
      likes: 234
    },
    {
      id: 2,
      title: 'Classic Margherita Pizza',
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400',
      author: { name: 'Jamie Oliver' },
      rating: 5.0,
      prepTime: 30,
      difficulty: 'Easy',
      likes: 567
    },
    {
      id: 3,
      title: 'Beef Tacos Supreme',
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
      author: { name: 'Maria Garcia' },
      rating: 4.8,
      prepTime: 25,
      difficulty: 'Easy',
      likes: 342
    },
    {
      id: 4,
      title: 'Fresh Garden Salad',
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
      author: { name: 'Health Chef' },
      rating: 4.2,
      prepTime: 15,
      difficulty: 'Easy',
      likes: 189
    },
    {
      id: 5,
      title: 'Chocolate Lava Cake',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
      author: { name: 'Pastry Queen' },
      rating: 4.9,
      prepTime: 40,
      difficulty: 'Hard',
      likes: 891
    },
    {
      id: 6,
      title: 'Grilled Salmon Fillet',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      author: { name: 'Seafood Master' },
      rating: 4.7,
      prepTime: 35,
      difficulty: 'Medium',
      likes: 445
    },
    {
      id: 7,
      title: 'Vegetable Stir Fry',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      author: { name: 'Asian Kitchen' },
      rating: 4.4,
      prepTime: 20,
      difficulty: 'Easy',
      likes: 278
    },
    {
      id: 8,
      title: 'Classic Burger Deluxe',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      author: { name: 'Burger Boss' },
      rating: 4.6,
      prepTime: 30,
      difficulty: 'Medium',
      likes: 512
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const data = await recipeService.getRecipes();
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecipes(mockRecipes);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const filters = [
    { value: 'all', label: 'All Recipes' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'dessert', label: 'Desserts' }
  ];

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">Discover Recipes</h1>
        <p className="home-subtitle">Explore thousands of delicious recipes from our community</p>
      </div>

      <div className="home-filters">
        {filters.map(f => (
          <button
            key={f.value}
            className={`filter-btn ${filter === f.value ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading recipes...</p>
        </div>
      ) : (
        <div className="recipes-grid">
        </div>
      )}
    </div>
  );
};

export default Home;