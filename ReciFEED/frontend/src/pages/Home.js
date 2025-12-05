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
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-header">
            <img src={require('../assets/ReciFEED-icon.png')} alt="ReciFEED Icon" className="hero-icon" />
            <h1 className="hero-title">ReciFEED</h1>
          </div>
          <p className="hero-tagline">Your Culinary Journey Starts Here</p>
          <p className="hero-description">
            Discover mouthwatering recipes, share your culinary masterpieces, and connect with a passionate community of food lovers from around the globe.
          </p>
          <div className="hero-actions">
            <button className="cta-btn cta-btn--primary" onClick={handleCreateAccount}>
              Get Started
            </button>
            <button className="cta-btn cta-btn--secondary" onClick={handleSignIn}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="features-heading">Why Choose ReciFEED?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#ff6b35" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3 className="feature-title">Discover Amazing Recipes</h3>
            <p className="feature-description">Explore thousands of recipes from various cuisines, all tested and loved by our community</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="feature-title">Join Our Community</h3>
            <p className="feature-description">Connect with fellow food enthusiasts, share tips, and learn from experienced chefs</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h10v2H4v-2zm0 4h7v2H4v-2zm14.5 2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-2.5-2.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z" stroke="#ff6b35" strokeWidth="2" fill="none"/>
                <circle cx="19" cy="16" r="2" stroke="#ff6b35" strokeWidth="2" fill="none"/>
                <path d="M19 18v2m0-2v-2m0 2h2m-2 0h-2" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="feature-title">Share, Like & Comment</h3>
            <p className="feature-description">Post your recipes and feeds, like others' creations, and join the conversation with comments!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;