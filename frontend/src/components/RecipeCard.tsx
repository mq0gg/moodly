import type { Recipe } from '../api/types';
import { mediaUrl } from '../api/client';
import { TagChip } from './TagChip';
import styles from './RecipeCard.module.css';

type RecipeCardProps = {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
};

export function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(recipe)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(recipe);
        }
      }}
      aria-label={`View full recipe for ${recipe.title}`}
    >
      <div className={styles.imageWrap}>
        {recipe.image ? (
          <img
            src={mediaUrl(recipe.image.url)}
            alt={recipe.image.alternativeText ?? ''}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          // No illustrations per the site's visual direction — an
          // unphotographed recipe gets a soft gradient block instead of a
          // placeholder icon or drawing.
          <div className={styles.imageFallback} aria-hidden="true" />
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{recipe.title}</h3>
        {recipe.summary && <p className={styles.summary}>{recipe.summary}</p>}
        {recipe.tags.length > 0 && (
          <ul className={styles.tagList}>
            {recipe.tags.map((tag) => (
              <li key={tag.id}>
                <TagChip tag={tag} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
