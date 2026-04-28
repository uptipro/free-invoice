import { useState } from "react";

export default function LoginPage({ onLogin, onRegister }) {
  const [profileId, setProfileId] = useState("");
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 12,
          minWidth: 320,
          boxShadow: "0 2px 16px #0002",
        }}
      >
        <h2>Login</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (profileId.trim()) onLogin(profileId.trim());
          }}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            name="profileId"
            placeholder="Enter your Profile ID"
            required
            style={{ padding: 8 }}
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
          />
          <button
            type="submit"
            style={{
              padding: 8,
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
            }}
          >
            Login
          </button>
        </form>
        <div style={{ marginTop: 16 }}>
          <span>Don't have a profile? </span>
          <button
            onClick={onRegister}
            style={{
              color: "#00b894",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
