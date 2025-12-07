import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import DocumentView from "./pages/DocumentView";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";

import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      {/* ✅ Show Navbar only when logged in */}
      {isLoggedIn && <Navbar />}

      <div className="container my-4">
        <Routes>
          {/* -------- PUBLIC ROUTES -------- */}
          <Route
            path="/login"
            element={
              isLoggedIn ? <Navigate to="/" replace /> : <Login />
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? <Navigate to="/" replace /> : <Register />
            }
          />

          {/* -------- PROTECTED ROUTES -------- */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doc/:id"
            element={
              <ProtectedRoute>
                <DocumentView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* -------- FALLBACK -------- */}
          <Route
            path="*"
            element={
              <Navigate to={isLoggedIn ? "/" : "/login"} replace />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
