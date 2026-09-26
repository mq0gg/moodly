import { useEffect, useRef } from 'react';
import type { Recipe } from '../api/types';
import { mediaUrl } from '../api/client';
import { TagChip } from './TagChip';
import styles from './RecipeModal.module.css';

type RecipeModalProps = {
  recipe: Recipe;
  onClose: () => void;
};

export function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeButtonRef} type="button" className={styles.close} onClick={onClose} aria-label="Close recipe">
          ×
        </button>

        {recipe.image ? (
          <img
            src={mediaUrl(recipe.image.url)}
            alt={recipe.image.alternativeText ?? ''}
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true" />
        )}

        <div className={styles.content}>
          <h2 id="recipe-modal-title" className={styles.title}>
            {recipe.title}
          </h2>
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

          <div className={styles.meta}>
            {recipe.prepMinutes != null && <span>{recipe.prepMinutes} min</span>}
            {recipe.servings != null && <span>{recipe.servings} serving{recipe.servings === 1 ? '' : 's'}</span>}
          </div>

          {recipe.ingredients.length > 0 && (
            <section>
              <h3 className={styles.sectionHeading}>Ingredients</h3>
              <ul className={styles.ingredients}>
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>
                    <strong>
                      {ing.amount} {ing.unit ?? ''}
                    </strong>{' '}
                    {ing.name}
                    {ing.note && <span className={styles.note}> ({ing.note})</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recipe.steps.length > 0 && (
            <section>
              <h3 className={styles.sectionHeading}>Steps</h3>
              <ol className={styles.steps}>
                {recipe.steps.map((step, i) => (
                  <li key={i}>{step.instruction}</li>
                ))}
              </ol>
            </section>
          )}

          {recipe.source !== 'original' && recipe.attribution && (
            <p className={styles.attribution}>Source: {recipe.attribution}</p>
          )}
        </div>
      </div>
    </div>
  );
}
