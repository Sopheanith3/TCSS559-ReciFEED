import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Recipe from './pages/Recipe';
import Login from './pages/Login';
import Register from './pages/Register';
import './components/Main.css';

function AppContent() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Check if current route is home page (landing page)
  const isHomePage = location.pathname === '/';
  // Check if current route is feed page
  const isFeedPage = location.pathname === '/feed';
  // Check if current route is recipe page
  const isRecipePage = location.pathname === '/recipe';
  // Check if current route is auth page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app">
      <div className="app-content">
        {!isAuthPage && showSidebar && (
          <Sidebar 
            onToggleCollapse={setIsSidebarCollapsed}
            isCollapsed={isSidebarCollapsed}
          />
        )}
        <main className={`main-content ${!isAuthPage && showSidebar ? 'with-sidebar' : ''} ${isSidebarCollapsed ? 'with-sidebar--collapsed' : ''} ${isHomePage ? 'home-landing' : ''} ${isFeedPage ? 'feed-page' : ''} ${isRecipePage ? 'recipe-page' : ''} ${isAuthPage ? 'auth-page' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Landing/Home Page */}
            <Route path="/" element={<Home />} />
            {/* Feed Page */}
            <Route path="/feed" element={<Feed />} />
            {/* Recipe Page */}
            <Route path="/recipe" element={<Recipe />} />
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Main() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default Main;