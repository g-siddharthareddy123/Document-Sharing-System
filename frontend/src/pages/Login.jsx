import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import showIcon from "../assets/show.png";
import hideIcon from "../assets/hidden.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const payload = { email, password };
    console.log("📤 Sending login payload:", payload);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Raw response:", res);

      const data = await res.json();
      console.log("📥 Parsed response JSON:", data);

      if (!res.ok) {
        // Backend sent error (400/500)
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("✅ Login success, navigating to /");
      navigate("/");
    } catch (err) {
      console.error("💥 Error while calling /user/login:", err);
      alert("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={submit}>
        <h2>Login</h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />

        {/* Password + ICON BUTTON */}
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

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          className="google-btn"
          onClick={() => alert("Google login not implemented yet")}
        >
          Login with Google
        </button>

        <p className="signup-text">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Sign Up</span>
        </p>
      </form>
    </div>
  );
}
