import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import "./Login.css";

const logo = "/mnt/data/0e9c1eb7-05b1-4d2e-908a-3088e066d1fb.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { doLogin } = useAuth();

  const successMsg = location.state?.info || "";
  const [message, setMessage] = useState(successMsg);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      await doLogin(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setMessage(err?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-container">
      <header className="login-header">
        <img src={logo} alt="Mabel logo" className="login-logo" />
        <h1>Login</h1>
      </header>

      <form onSubmit={onSubmit} className="login-form">
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={busy}>
          {busy ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="login-register">
        Don't have an account? <Link to="/register">Register</Link>
      </div>

      {message && (
        <div
          className={`login-message ${
            message.includes("successful") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}
    </main>
  );
}
