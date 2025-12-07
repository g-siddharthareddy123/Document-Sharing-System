// src/pages/Dashboard.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);

  const onLogout = () => {
  // optional: clear auth data
  localStorage.clear(); // or remove specific keys

  // ✅ FULL reload + go to login
  window.location.href = "/login";
};

  return (
    <div className="dashboard d-flex">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="content p-4 flex-grow-1">
        <Outlet context={{ reloadKey, setReloadKey }} />
      </main>
    </div>
  );
}
