import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For programmatic navigation

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user.id);

        // Redirect based on role
        if (data.user.role === "owner") {
          navigate("/owner-dashboard");
        } else if (data.user.role === "renter") {
          navigate("/renter-dashboard");
        } else {
          navigate("/"); // fallback to home
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong, please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label><br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password</label><br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit">Login</button>
    </form>
  );
}
