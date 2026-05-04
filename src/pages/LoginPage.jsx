import React, { useState } from "react";
import appLogo from "../assets/logo/free invoice logo.png";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function LoginPage({ onLogin, onRegister, onGuest }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }
      localStorage.setItem("profile", JSON.stringify(data));
      onLogin(data);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src={appLogo} alt="Free Invoice" style={styles.logo} />
        </div>

        <h1 style={styles.heading}>Sign in</h1>
        <p style={styles.subheading}>
          Welcome back — enter your details to continue
        </p>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={styles.input}
            autoComplete="email"
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={styles.input}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={styles.dividerRow}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <button onClick={onGuest} style={styles.guestBtn}>
          Continue as Guest
        </button>

        <p style={styles.registerPrompt}>
          No account yet?{" "}
          <button onClick={onRegister} style={styles.linkBtn}>
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    minHeight: "100vh",
    background: "var(--color-bg, #f7f7f5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-family-base, 'Futura', Avenir, Inter, sans-serif)",
    padding: "24px 16px",
  },
  card: {
    background: "var(--color-surface, #ffffff)",
    borderRadius: 16,
    boxShadow: "var(--shadow-soft, 0 18px 40px rgba(15,23,42,0.08))",
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
  },
  logoWrap: { textAlign: "center", marginBottom: 24 },
  logo: { height: 44, objectFit: "contain" },
  heading: {
    margin: "0 0 4px",
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text, #1c1c1e)",
    letterSpacing: "-0.3px",
  },
  subheading: {
    margin: "0 0 24px",
    fontSize: 14,
    color: "var(--color-grey-dark, #6e6e73)",
  },
  errorBanner: {
    background: "#fff0f0",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
  form: { display: "flex", flexDirection: "column", gap: 4 },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text, #1c1c1e)",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid var(--color-grey, #d1d1d6)",
    background: "var(--color-bg, #f7f7f5)",
    fontSize: 15,
    color: "var(--color-text, #1c1c1e)",
    outline: "none",
    boxSizing: "border-box",
  },
  primaryBtn: {
    marginTop: 20,
    width: "100%",
    padding: "12px 0",
    background: "var(--color-accent, #0f172a)",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.3px",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "var(--color-grey-light, #ececeb)",
  },
  dividerText: {
    fontSize: 12,
    color: "var(--color-grey-dark, #6e6e73)",
    flexShrink: 0,
  },
  guestBtn: {
    width: "100%",
    padding: "12px 0",
    background: "transparent",
    color: "var(--color-accent, #0f172a)",
    border: "1.5px solid var(--color-grey, #d1d1d6)",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  registerPrompt: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 13,
    color: "var(--color-grey-dark, #6e6e73)",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "var(--color-accent, #0f172a)",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
    textDecoration: "underline",
  },
};
