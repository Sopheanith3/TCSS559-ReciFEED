import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="home-page">
      <div className="landing-container">
        <div className="landing-content">
          <div className="landing-title-row">
            <img src={require('../assets/ReciFEED-icon.png')} alt="ReciFEED Icon" className="landing-title-icon" />
            <h1 className="landing-title">Welcome to ReciFEED</h1>
          </div>
          <p className="landing-subtitle">
            Discover, share, and explore thousands of delicious recipes from our vibrant community
          </p>
          <p className="landing-description">
            Join ReciFEED today to unlock a world of culinary inspiration. 
            Share your favorite recipes, connect with food lovers, and find your next meal idea.
          </p>
          <div className="landing-actions">
            <button className="landing-btn landing-btn--primary" onClick={handleCreateAccount}>
              Create Account
            </button>
            <button className="landing-btn landing-btn--secondary" onClick={handleSignIn}>
              Sign In
            </button>
          </div>
          <div className="landing-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#007bff" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3>Discover Recipes</h3>
              <p>Browse thousands of delicious recipes from around the world</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Join Community</h3>
              <p>Connect with food lovers and share your culinary creations</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Save Favorites</h3>
              <p>Create collections and save recipes you love for later</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;