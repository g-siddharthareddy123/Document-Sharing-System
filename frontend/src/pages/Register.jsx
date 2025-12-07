// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

import showIcon from "../assets/show.png";
import hideIcon from "../assets/hidden.png";

const API_BASE_URL = "http://localhost:5000";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { name, email, password };
      console.log("➡️ Sending register payload:", payload);

      const res = await axios.post(
        `${API_BASE_URL}/user/register`, // change to /user/register if your route is different
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Register response:", res.data);

      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("❌ Register error:", err);

      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={submit}>
        <h2>Sign Up</h2>

        {/* Name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          type="text"
          required
        />

        {/* Email */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />

        {/* Password + Icon */}
        <div className="password-wrapper">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          <img
            src={showPass ? hideIcon : showIcon}
            className="pass-icon"
            onClick={() => setShowPass(!showPass)}
            alt="toggle visibility"
          />
        </div>

        {/* Signup Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Google Signup */}
        <button type="button" className="google-btn">
          Sign Up with Google
        </button>

        {/* Login Link */}
        <p className="signup-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
    </div>
  );
}
