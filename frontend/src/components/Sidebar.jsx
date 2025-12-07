// src/components/Sidebar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="sidebar bg-white border-end">
      <div className="sidebar-top p-3 text-center">
        <div className="avatar mb-2">{(user?.name?.[0] || "U").toUpperCase()}</div>
        <div className="fw-bold">{user?.name || "Guest"}</div>
        <div className="text-muted small">{user?.email}</div>
      </div>

      <nav className="nav flex-column p-2">
        <Link className="nav-link" to="/dashboard">Dashboard</Link>
        <Link className="nav-link" to="/dashboard/upload">Upload Document</Link>
        <Link className="nav-link" to="/dashboard/important">Important Docs</Link>
        <Link className="nav-link" to="/dashboard/help">Help / Contact</Link>
        <hr />
        <Link className="nav-link small" to="/profile">Profile & Settings</Link>
        <Link className="nav-link small" to="/profile/change-password">Change Password</Link>
        <button className="nav-link btn btn-link text-danger small" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); onLogout?.(); navigate("/login"); }}>
          Logout
        </button>
      </nav>
    </div>
  );
}
