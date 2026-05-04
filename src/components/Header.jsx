import React from "react";
import styles from "./Header.module.css";
import appLogo from "../assets/logo/free invoice logo.png";
import NotificationBell from "./NotificationBell";

export default function Header({
  invoiceCount,
  profile,
  onLogin,
  onCreateProfile,
  onLogout,
}) {
  function handleLogout() {
    localStorage.removeItem("profile");
    if (onLogout) onLogout();
    else window.location.href = "/";
  }

  function handleWhatsAppShare() {
    const text = encodeURIComponent(
      "Hi, I have sent you a new quote via Free Invoice. Please check your dashboard or contact me for details.",
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  const btn = {
    padding: "8px 18px",
    borderRadius: 6,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  };

  return (
    <div className={styles.header}>
      <img src={appLogo} alt="Free Invoice logo" className={styles.logo} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className={styles.counter}>
          <span className={styles.counterNumber}>{invoiceCount}</span>
          <span className={styles.counterLabel}>Invoices Created</span>
        </div>
        {profile ? (
          <>
            <NotificationBell profileId={profile.id} />

            {/* Profile name badge */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text, #1c1c1e)",
                background: "var(--color-accent-soft, #f1f5f9)",
                borderRadius: 20,
                padding: "5px 14px",
              }}
            >
              {profile.name || profile.email}
            </span>

            <button
              onClick={handleWhatsAppShare}
              style={{
                ...btn,
                background: "#25d366",
                color: "#fff",
                border: "1px solid #25d366",
              }}
            >
              Share via WhatsApp
            </button>
            <button
              onClick={handleLogout}
              style={{
                ...btn,
                background: "var(--color-surface, #fff)",
                border: "1px solid var(--color-grey, #d1d1d6)",
                color: "var(--color-text, #1c1c1e)",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onLogin}
              style={{
                ...btn,
                background: "var(--color-accent, #0f172a)",
                color: "#fff",
                border: "none",
              }}
            >
              Sign in
            </button>
            <button
              onClick={onCreateProfile}
              style={{
                ...btn,
                background: "transparent",
                border: "1.5px solid var(--color-grey, #d1d1d6)",
                color: "var(--color-accent, #0f172a)",
              }}
            >
              Create account
            </button>
          </>
        )}
      </div>
    </div>
  );
}
