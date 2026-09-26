import styles from './StripeAccent.module.css';

type StripeAccentProps = {
  /** Where the stripe sits relative to its section. */
  position: 'top' | 'right';
  /** Subset of palette colors to cycle through; defaults to the full set. */
  colors?: string[];
};

const DEFAULT_COLORS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-energy)',
  'var(--color-accent)',
  'var(--color-fresh)',
];

/**
 * The site's only decorative motif: a row (or column) of soft color
 * stripes in the Moodly palette. No illustrations, icons, or imagery —
 * matches the "breezy & minimal" direction and works for any section,
 * any time of year.
 */
export function StripeAccent({ position, colors = DEFAULT_COLORS }: StripeAccentProps) {
  return (
    <div
      className={position === 'top' ? styles.top : styles.right}
      aria-hidden="true"
    >
      {colors.map((color, i) => (
        <span key={i} style={{ background: color }} />
      ))}
    </div>
  );
}
