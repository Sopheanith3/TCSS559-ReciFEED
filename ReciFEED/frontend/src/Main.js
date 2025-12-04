import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './layout/SideBar';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Recipe from './pages/Recipe';
import Login from './pages/Login';
import Register from './pages/Register';
import './components/Main.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// Home Route Component - redirect to feed if logged in
function HomeRoute() {
  const { token } = useAuth();
  
  if (token) {
    return <Navigate to="/feed" replace />;
  }
  
  return <Home />;
}

function AppContent() {
  const location = useLocation();
  const { token } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true);

  // Check if current route is home page (landing page)
  const isHomePage = location.pathname === '/';
  // Check if current route is feed page
  const isFeedPage = location.pathname === '/feed';
  // Check if current route is recipe page
  const isRecipePage = location.pathname === '/recipe';
  // Check if current route is auth page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  // Show sidebar only when user is authenticated and not on auth pages
  const showSidebar = token && !isAuthPage;

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
            {/* Landing/Home Page - redirects to feed if logged in */}
            <Route path="/" element={<HomeRoute />} />
            {/* Protected Routes */}
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/recipe" element={<ProtectedRoute><Recipe /></ProtectedRoute>} />
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