// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://127.0.0.1:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // API endpoints for checking roles
  const roleCheckEndpoints = [
    { role: "admin", url: "/api/admin/get_current_admin_user" },
    { role: "citizen", url: "/api/auth/get_current_user" }
  ];

  // Get cookie value by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // Set cookie
  const setCookie = (name, value, days = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  };

  // Delete cookie
  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  };

  // Clear all authentication cookies
  const clearAuthCookies = () => {
    deleteCookie("session");
    deleteCookie("admin_session");
    deleteCookie("csrf_token");
    deleteCookie("remember_token");
    deleteCookie("user_role");
  };

  // Check which role the logged-in user has
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setLoading(true);
        let userFound = false;

        for (const { role, url } of roleCheckEndpoints) {
          try {
            const res = await axios.get(url);
            if (res.data && res.data.user) {
              setUser({ ...res.data.user, role });
              userFound = true;

              // Set role indicator cookie
              setCookie("user_role", role, 1); // Expires in 1 day
              break; // Stop checking once a valid user is found
            }
          } catch (err) {
            if (err.response?.status !== 401) {
              console.error(`Error checking ${role} session:`, err);
            }
          }
        }

        if (!userFound) {
          // Clear any stale authentication data if no user found
          clearAuthCookies();
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking user role:", err);
        clearAuthCookies();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  // Login function
  const login = async ({ email, password, endpoint }) => {
    try {
      const res = await axios.post(`/api/${endpoint}/login`, {
        email,
        password,
      });

      if (res.data && res.data.user) {
        const userData = { ...res.data.user, role: endpoint };
        setUser(userData);

        // Set role indicator cookie
        setCookie("user_role", endpoint, 1);

        return { success: true, user: userData };
      }

      return { success: false, error: res.data.error || "Login failed" };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Login failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
  try {
    if (user?.role === "admin") {
      await axios.post("/api/admin/logout");
    } else if (user?.role === "citizen") {
      await axios.post("/api/auth/logout");
    }
  } catch (err) {
    if (err.response?.status !== 401) {
      console.error("Logout error:", err);
    }
  } finally {
    clearAuthCookies();
    setUser(null);

      // Redirect to login page (no reload)
      navigate("/login");
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated,
        getCookie,
        setCookie,
        deleteCookie,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
