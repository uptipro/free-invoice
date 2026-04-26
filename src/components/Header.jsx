import React from "react";
import styles from "./Header.module.css";
import appLogo from "../assets/logo/free invoice logo.png";
import NotificationBell from "./NotificationBell";

export default function Header({ invoiceCount, profileId }) {
  return (
    <div className={styles.header}>
      <img src={appLogo} alt="Free Invoice logo" className={styles.logo} />
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div className={styles.counter}>
          <span className={styles.counterNumber}>{invoiceCount}</span>
          <span className={styles.counterLabel}>Invoices Created</span>
        </div>
        {profileId && <NotificationBell profileId={profileId} />}
      </div>
    </div>
  );
}
