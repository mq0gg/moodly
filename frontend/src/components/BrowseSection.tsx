import { useMemo, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getRecipes } from '../api/recipes';
import { getTags } from '../api/tags';
import type { Recipe } from '../api/types';
import { FilterBar } from './FilterBar';
import { RecipeGrid } from './RecipeGrid';
import { RecipeModal } from './RecipeModal';
import styles from './RecipeGrid.module.css';

export function BrowseSection() {
  const recipesState = useAsync(getRecipes, []);
  const tagsState = useAsync(getTags, []);

  const [search, setSearch] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTagIds(new Set());
  };

  const filteredRecipes = useMemo(() => {
    if (recipesState.status !== 'success') return [];
    const query = search.trim().toLowerCase();

    return recipesState.data.filter((recipe) => {
      const matchesSearch = !query || recipe.title.toLowerCase().includes(query);
      const matchesTags =
        selectedTagIds.size === 0 ||
        Array.from(selectedTagIds).every((tagId) => recipe.tags.some((t) => t.id === tagId));
      return matchesSearch && matchesTags;
    });
  }, [recipesState, search, selectedTagIds]);

  if (recipesState.status === 'loading' || tagsState.status === 'loading') {
    return <p className={styles.message}>Loading recipes…</p>;
  }

  if (recipesState.status === 'error') {
    return (
      <p className={styles.message}>Couldn&rsquo;t load recipes right now. Make sure the backend is running.</p>
    );
  }

  return (
    <>
      {tagsState.status === 'success' && (
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          tags={tagsState.data}
          selectedTagIds={selectedTagIds}
          onToggleTag={toggleTag}
          onClear={clearFilters}
        />
      )}

      <RecipeGrid recipes={filteredRecipes} onSelect={setSelectedRecipe} />

      {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
    </>
  );
}
