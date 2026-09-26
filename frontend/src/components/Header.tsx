import styles from './Header.module.css';

const NAV_LINKS = [
  { href: '#browse', label: 'Browse' },
  { href: '#quiz', label: 'SipSense' },
  { href: '#suggest', label: 'Suggest' },
  { href: '#experience', label: 'Experience' },
  { href: '#about', label: 'About' },
];

export function Header() {
  return (
    <header className={styles.header}>
      <a href="#top" className={styles.brand}>
        Moodly
      </a>
      <nav className={styles.nav} aria-label="Main">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
