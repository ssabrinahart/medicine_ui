import React from 'react';

const FOOTER_HEIGHT = 64; // px

function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.copy}>&copy; 2025 MediJane LLC</p>
      <ul id="primary-navigation" style={styles.nav}>
        <li>Contact</li><span aria-hidden> | </span>
        <li>FAQ</li><span aria-hidden> | </span>
        <li>Terms</li>
      </ul>
    </footer>
  );
}

const styles = {
  footer: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    height: FOOTER_HEIGHT,      // reserve a fixed height
    backgroundColor: '#eee',    // fully opaque
    boxShadow: '0 -2px 8px rgba(0,0,0,.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,               // higher than calendar
    height: 100,
  },
  copy: { margin: 0 },
  nav: {
    listStyle: 'none',
    padding: 0,
    margin: '4px 0 0',
    display: 'inline-flex',
    gap: '8px',
  },
};

export default Footer;
