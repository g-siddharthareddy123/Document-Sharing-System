import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute
 * ----------------
 * Blocks access if user is not logged in
 * Redirects to /login
 * Preserves the requested path (optional)
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // ❌ Not logged in → go to login
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }} // optional: redirect back after login
      />
    );
  }

  // ✅ Logged in → allow access
  return children;
}
