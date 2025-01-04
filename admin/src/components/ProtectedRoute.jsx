import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [loading, setLoading] = useState(true); // to handle loading state while checking session
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Check if the user is logged in
        const response = await axios.get("http://localhost:3001/login", {
          withCredentials: true,
        });

        if (response.data.loggedIn) {
          const { user } = response.data;
          setUser(user);

          // Check if the user's role is allowed for this route
          if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            // If role is not allowed, redirect to dashboard or any other page
            navigate("/dashboard");
          }
        } else {
          // Redirect to login if not logged in
          navigate("/");
        }
      } catch (err) {
        console.log("Error checking login status", err);
        navigate("/"); // Redirect to login if error in fetching session
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [allowedRoles, navigate]);

  if (loading) {
    // You can show a loading spinner or placeholder while checking login status
    return <div></div>;
  }

  if (!user) {
    // If user is not authenticated or session is invalid, redirect to login
    return <Navigate to="/" />;
  }

  // If user is authenticated and authorized, render the children (protected content)
  return children;
};

export default ProtectedRoute;
