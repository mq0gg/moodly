import type { Tag, TagDimension } from '../api/types';
import { TagChip } from './TagChip';
import styles from './FilterBar.module.css';

const DIMENSION_LABEL: Record<TagDimension, string> = {
  mood: 'Mood',
  flavor: 'Flavor',
  caffeine: 'Caffeine',
  temperature: 'Temperature',
  time: 'Time',
  difficulty: 'Difficulty',
};

const DIMENSION_ORDER: TagDimension[] = ['mood', 'flavor', 'caffeine', 'temperature', 'time', 'difficulty'];

type FilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  tags: Tag[];
  selectedTagIds: Set<number>;
  onToggleTag: (tagId: number) => void;
  onClear: () => void;
};

export function FilterBar({ search, onSearchChange, tags, selectedTagIds, onToggleTag, onClear }: FilterBarProps) {
  const byDimension = DIMENSION_ORDER.map((dimension) => ({
    dimension,
    tags: tags.filter((t) => t.dimension === dimension),
  })).filter((group) => group.tags.length > 0);

  return (
    <div className={styles.bar}>
      <input
        type="search"
        className={styles.search}
        placeholder="Search recipes…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search recipes by title"
      />

      <div className={styles.groups}>
        {byDimension.map((group) => (
          <div key={group.dimension} className={styles.group}>
            <span className={styles.groupLabel}>{DIMENSION_LABEL[group.dimension]}</span>
            <div className={styles.chips}>
              {group.tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={selectedTagIds.has(tag.id) ? styles.chipSelected : styles.chipButton}
                  onClick={() => onToggleTag(tag.id)}
                  aria-pressed={selectedTagIds.has(tag.id)}
                >
                  <TagChip tag={tag} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(search || selectedTagIds.size > 0) && (
        <button type="button" className={styles.clear} onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
