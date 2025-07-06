import React from 'react';

function Footer() {
  return (
    <footer style={styles.footer}>
      <p>&copy; 2025 MediJane LLC   </p>
      <ul id='primary-navigation'>
        <li>Contact</li>
        <li>FAQ</li>
        <li>Terms</li>
      </ul>

    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#eee',
    padding: '10px',
    textAlign: 'center',
    position: 'fixed',
    bottom: 0,
    width: '100%'
  }
};

export default Footer;