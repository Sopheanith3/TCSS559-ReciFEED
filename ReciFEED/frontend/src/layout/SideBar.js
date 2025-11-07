import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/ReciFEED-logo.png';
import icon from '../assets/ReciFEED-icon.png';

const Sidebar = ({ onToggleCollapse, isCollapsed: externalIsCollapsed }) => {
  const location = useLocation();
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;

  const toggleSidebar = () => {
    if (onToggleCollapse) {
      onToggleCollapse(!isCollapsed);
    } else {
      setInternalIsCollapsed(!internalIsCollapsed);
    }
  };

  const navItems = [
    {
      path: '/',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: 'Home'
    },
    {
      path: '/search',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      label: 'Search'
    },
    {
      path: '/feed',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 7h10M7 12h10M7 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      label: 'Feed'
    },
    {
      path: '/recipe',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 7h10M7 12h10M7 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      label: 'Recipe'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar__logo-container">
        {isCollapsed ? (
          <img src={icon} alt="ReciFEED Icon" className="sidebar__logo-image" />
        ) : (
          <img src={logo} alt="ReciFEED Logo" className="sidebar__logo-image" />
        )}
      </div>

      {/* Navigation Items */}
      <nav className="sidebar__navigation">
        <ul className="sidebar__nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="sidebar__nav-item">
              <Link
                to={item.path}
                className={`sidebar__nav-link ${isActive(item.path) ? 'sidebar__nav-link--active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                <span className="sidebar__nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile Section at Bottom with Menu Button */}
      <div className="sidebar__footer">
        <Link
          to="/profile"
          className={`sidebar__profile-link ${isActive('/profile') ? 'sidebar__profile-link--active' : ''}`}
          title={isCollapsed ? 'Profile' : ''}
        >
          <span className="sidebar__profile-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>
          <span className="sidebar__profile-label">Profile</span>
        </Link>

        {/* Hamburger Menu Button */}
        <button 
          className="sidebar__toggle-button" 
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            className="sidebar__toggle-icon" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M3 12h18M3 6h18M3 18h18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;