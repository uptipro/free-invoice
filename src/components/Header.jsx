import React from 'react';
import styles from './Header.module.css';
import appLogo from '../assets/logo/free invoice logo.png';

export default function Header({ exportedCount }) {
  return (
    <div className={styles.header}>
      <img src={appLogo} alt="Free Invoice logo" className={styles.logo} />
      <div className={styles.counter} title="Total invoices exported">
        <span className={styles.counterNumber}>{exportedCount}</span>
        <span className={styles.counterLabel}>Invoice{exportedCount !== 1 ? 's' : ''} Created</span>
      </div>
    </div>
  );
}
