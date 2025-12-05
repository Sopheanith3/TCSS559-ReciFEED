import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/layout/Navbar.css';

const Navbar = ({ currentUser, isSidebarCollapsed }) => {
  return (
    <nav className={`navbar ${isSidebarCollapsed ? 'navbar--sidebar-collapsed' : ''}`}>
      <div className="navbar-container">
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