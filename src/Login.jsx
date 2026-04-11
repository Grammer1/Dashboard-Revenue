import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (email === "admin@primo.com" && password === "123456") {
      localStorage.setItem("auth", "true");
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #070d14 0%, #0b1622 50%, #070d14 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e8f0fa"
    }}>
      
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: 32,
        width: 320
      }}>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          marginBottom: 8
        }}>
          Primo Dashboard
        </h1>

        <p style={{ fontSize: 12, color: "#7a9bbf", marginBottom: 20 }}>
          Login to access your revenue system
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <div style={{ color: "#FF6B6B", fontSize: 12, marginBottom: 10 }}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} style={{
          width: "100%",
          padding: "10px",
          background: "#00C9A7",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          cursor: "pointer",
          color: "#070d14"
        }}>
          Login
        </button>

      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: 12,
  padding: "10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "#e8f0fa",
  outline: "none"
};