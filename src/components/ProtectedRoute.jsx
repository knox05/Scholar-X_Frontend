import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // If no token → go login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If role mismatch → go login
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
