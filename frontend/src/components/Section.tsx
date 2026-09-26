import type { PropsWithChildren } from 'react';
import { StripeAccent } from './StripeAccent';
import styles from './Section.module.css';

type SectionProps = PropsWithChildren<{
  id: string;
  title: string;
  /** Card-style surface with a top stripe (default) vs a plain full-width
   * block with a right-edge stripe — gives sections visual variety without
   * introducing any new decorative motif. */
  variant?: 'card' | 'block';
}>;

export function Section({ id, title, variant = 'card', children }: SectionProps) {
  return (
    <section id={id} className={variant === 'card' ? styles.card : styles.block}>
      {variant === 'card' ? <StripeAccent position="top" /> : <StripeAccent position="right" />}
      <h2 className={styles.heading}>{title}</h2>
      {children}
    </section>
  );
}
