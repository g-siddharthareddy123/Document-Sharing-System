import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notifications from "./Notifications";
import axios from "axios";
import "./Navbar.css";

const API_BASE_URL = "http://localhost:5000";

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [notifCount, setNotifCount] = useState(0);

  // ✅ Sync navbar when login/logout happens (in same tab)
  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", syncUser);
    syncUser();

    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // ✅ Fetch notifications count
  useEffect(() => {
    if (!user) {
      setNotifCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        // OPTIONAL backend endpoint
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const count =
          res.data?.notifications?.filter((n) => !n.read)?.length || 0;

        setNotifCount(count);

        // Keep user in localStorage synced
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        // fallback: localStorage notifications
        const stored = JSON.parse(localStorage.getItem("user"));
        const count =
          stored?.notifications?.filter((n) => !n.read)?.length || 0;

        setNotifCount(count);
      }
    };

    fetchNotifications();
  }, [user]);

  // ✅ Logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          DocShare
        </Link>

        {/* ✅ Bootstrap Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          {/* LEFT MENU */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/upload">
                  Upload
                </Link>
              </li>
            )}

            {user?.role === "admin" && (
              <li className="nav-item">
                <Link className="nav-link text-danger" to="/admin">
                  Admin
                </Link>
              </li>
            )}
          </ul>

          {/* RIGHT MENU */}
          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                {/* Notifications */}
                <li className="nav-item me-3">
                  <Notifications count={notifCount} />
                </li>

                {/* User Dropdown */}
                <li className="nav-item dropdown">
                  <span
                    className="nav-link dropdown-toggle"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    {user.name || "User"}
                  </span>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        Profile & Settings
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={logout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
