import React from 'react';
import styles from './Header.module.css';
import appLogo from '../assets/logo/free invoice logo.png';

export default function Header({ invoiceCount }) {
  return (
    <div className={styles.header}>
      <img src={appLogo} alt="Free Invoice logo" className={styles.logo} />
      <div className={styles.counter}>
        <span className={styles.counterNumber}>{invoiceCount}</span>
        <span className={styles.counterLabel}>Invoices Created</span>
      </div>
    </div>
  );
}
