import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Sidebar from './layout/SideBar';
import Home from './pages/Home';
// import Login from './auth/Login';
// import Register from './auth/Register';
import './Main.css';

function Main() {
  // TODO: Replace with actual auth state management
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showSidebar, setShowSidebar] = React.useState(true);

  // Check if current route is auth page
  const isAuthPage = () => {
    // return window.location.pathname === '/login' || window.location.pathname === '/register';
    return false; // Always show nav/sidebar for now
  };

  return (
    <Router>
      <div className="app">
        {!isAuthPage() && <Navbar currentUser={currentUser} />}
        
        <div className="app-content">
          {!isAuthPage() && showSidebar && <Sidebar />}
          
          <main className={`main-content ${!isAuthPage() && showSidebar ? 'with-sidebar' : ''}`}>
            <Routes>
              {/* Public Routes */}
              {/* <Route path="/login" element={<Login />} /> */}
              {/* <Route path="/register" element={<Register />} /> */}
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={<Home />} 
              />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default Main;