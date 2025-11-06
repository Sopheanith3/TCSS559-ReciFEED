import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ currentUser }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#ff6b35"/>
              <path d="M16 8C13.79 8 12 9.79 12 12V14H10V22C10 23.1 10.9 24 12 24H20C21.1 24 22 23.1 22 22V14H20V12C20 9.79 18.21 8 16 8ZM16 10C17.1 10 18 10.9 18 12V14H14V12C14 10.9 14.9 10 16 10ZM12 16H20V22H12V16Z" fill="white"/>
            </svg>
          </div>
          <span className="logo-text">ReciFEED</span>
        </Link>

        <div className="navbar-search">
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search recipes, users..."
            className="search-input"
          />
        </div>

        <div className="navbar-actions">
          {currentUser ? (
            <>
              <Link to="/feed" className="nav-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16v16H4V4z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 8h8M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Link>
              <Link to="/notifications" className="nav-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/profile" className="nav-link">
                <div className="user-avatar">
                  <img src={currentUser.avatar || '/default-avatar.png'} alt="User" />
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-button">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;