import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/ReciFEED-logo.png';
import icon from '../assets/ReciFEED-icon.png';

const Sidebar = ({ onToggleCollapse, isCollapsed: externalIsCollapsed }) => {
  const location = useLocation();
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true);
  
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
          <path d="M12 2C10.4 2 9 3.4 9 5V6C9 6 6 10.5 6 12C6 14 6 18 6 18M12 2C13.6 2 15 3.4 15 5V6C15 6 18 10.5 18 12C18 14 18 18 18 18M12 2V22M6 18H18M6 18C6 19.66 7.34 21 9 21H15C16.66 21 18 19.66 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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