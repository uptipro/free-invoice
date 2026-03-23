import React from 'react';
import styles from './Header.module.css';
import appLogo from '../assets/logo/free invoice logo.png';

export default function Header() {
  return <img src={appLogo} alt="Free Invoice logo" className={styles.logo} />;
}
