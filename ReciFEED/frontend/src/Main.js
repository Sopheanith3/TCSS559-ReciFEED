import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Sidebar from './layout/SideBar';
import Home from './pages/Home';
// import Login from './auth/Login';
// import Register from './auth/Register';
import './Main.css';

function AppContent() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Check if current route is home page (landing page)
  const isHomePage = location.pathname === '/';
  
  // Check if current route is auth page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app">
      {!isHomePage && !isAuthPage && (
        <Navbar 
          currentUser={currentUser} 
          isSidebarCollapsed={isSidebarCollapsed}
        />
      )}
      
      <div className="app-content">
        {!isAuthPage && showSidebar && (
          <Sidebar 
            onToggleCollapse={setIsSidebarCollapsed}
            isCollapsed={isSidebarCollapsed}
          />
        )}
        
        <main className={`main-content ${!isAuthPage && showSidebar ? 'with-sidebar' : ''} ${isSidebarCollapsed ? 'with-sidebar--collapsed' : ''} ${isHomePage ? 'home-landing' : ''}`}>
          <Routes>
            {/* Public Routes */}
            {/* <Route path="/login" element={<Login />} /> */}
            {/* <Route path="/register" element={<Register />} /> */}
            
            {/* Landing/Home Page */}
            <Route path="/" element={<Home />} />
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