/**
* AuthContext.js
* -------------------------------
* This file provides global authentication state for the React frontend.
* It stores:
* - the user's login info (id)
* - the JWT token returned by the backend
*/

import React, { createContext, useState, useEffect, useContext } from "react";

// Create a Context object to share authentication data across the app
export const AuthContext = createContext();

/**
* AuthProvider Component
* -------------------------------
* Wraps the entire React app and provides authentication state + functions.
*/
export const AuthProvider = ({ children }) => {
  // Holds the currently logged-in user's id (or null)
  const [user, setUser] = useState(null);

  // Holds the JWT token, restored from localStorage if available
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      const userId = localStorage.getItem("user");
      if (userId) {
        setUser({ userId });
      }
    }
  }, [token]);

  const login = (userObject, token) => {
    setUser(userObject);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(userObject));
    localStorage.setItem("token", token);
  };

  /**
  * logout()
  * -------------------------------
  * Clears authentication data everywhere.
  */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
* useAuth()
* -------------------------------
* A simple convenience hook so components
* can call: const { user, token, login, logout } = useAuth();
*/
export const useAuth = () => useContext(AuthContext);
