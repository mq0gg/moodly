import type { Tag, TagDimension } from '../api/types';
import styles from './TagChip.module.css';

const DIMENSION_CLASS: Record<TagDimension, string> = {
  mood: styles.mood,
  flavor: styles.flavor,
  caffeine: styles.caffeine,
  temperature: styles.temperature,
  time: styles.time,
  difficulty: styles.difficulty,
};

export function TagChip({ tag }: { tag: Tag }) {
  return <span className={`${styles.chip} ${DIMENSION_CLASS[tag.dimension]}`}>{tag.label}</span>;
}
