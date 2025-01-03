import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading/Loading";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);  // Track loading state

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get("http://localhost:3001/user-details", {
        withCredentials: true,
      });
      setRole(response.data.role);  // Set role to state
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      setRole(null); // In case of error, assume no role
    } finally {
      setLoading(false); // Set loading to false after the API call finishes
    }
  };

  // If still loading, show nothing or a loading indicator
  if (loading) {
    return <Loading loading={loading}/>; // Or you can show a spinner here
  }

  // If role is null or not allowed, redirect accordingly
  if (role === null) {
    return <Navigate to="/" />;
  }

  // If the role exists but is not in allowedRoles, redirect to dashboard
  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }

  // Render the protected route if role is valid
  return children;
};

export default ProtectedRoute;
