import React from "react";
import styles from "./Header.module.css";
import appLogo from "../assets/logo/free invoice logo.png";
import NotificationBell from "./NotificationBell";
import { supabase } from "../utils/supabaseClient";

export default function Header({
  invoiceCount,
  profileId,
  onLogin,
  onCreateProfile,
}) {
  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("profileId");
    window.location.href = "/";
  }

  function handleWhatsAppShare() {
    const text = encodeURIComponent(
      "Hi, I have sent you a new quote via Free Invoice. Please check your dashboard or contact me for details.",
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className={styles.header}>
      <img src={appLogo} alt="Free Invoice logo" className={styles.logo} />
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div className={styles.counter}>
          <span className={styles.counterNumber}>{invoiceCount}</span>
          <span className={styles.counterLabel}>Invoices Created</span>
        </div>
        {profileId ? (
          <>
            <NotificationBell profileId={profileId} />
            <button
              onClick={handleWhatsAppShare}
              style={{
                marginLeft: 16,
                padding: "8px 18px",
                borderRadius: 6,
                border: "1px solid #25d366",
                background: "#25d366",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Share via WhatsApp
            </button>
            <button
              onClick={handleLogout}
              style={{
                marginLeft: 8,
                padding: "8px 18px",
                borderRadius: 6,
                border: "1px solid #e0e0e0",
                background: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                color: "black",
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
                marginLeft: 16,
                padding: "8px 18px",
                borderRadius: 6,
                border: "1px solid #007bff",
                background: "#007bff",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Login
            </button>
            <button
              onClick={onCreateProfile}
              style={{
                marginLeft: 8,
                padding: "8px 18px",
                borderRadius: 6,
                border: "1px solid #00b894",
                background: "#00b894",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}
