import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.brand}>Moodly</p>
      <p className={styles.tagline}>Drinks that match your mood — coffee, matcha, and fresh halal drinks.</p>
      <nav className={styles.links} aria-label="Footer">
        <a href="https://github.com/mq0gg/moodly" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="#about">About</a>
        <span aria-hidden="true">·</span>
        <span>v0.1</span>
      </nav>
    </footer>
  );
}
