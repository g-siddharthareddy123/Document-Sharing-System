// src/utils/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  if (!token) {
    // no token → go to register (as you requested)
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // token exists; allow
  return children;
}
