import type { Recipe } from '../api/types';
import { RecipeCard } from './RecipeCard';
import styles from './RecipeGrid.module.css';

type RecipeGridProps = {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
};

export function RecipeGrid({ recipes, onSelect }: RecipeGridProps) {
  if (recipes.length === 0) {
    return <p className={styles.message}>No recipes match — try adjusting your filters.</p>;
  }

  return (
    <div className={styles.grid}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelect} />
      ))}
    </div>
  );
}
