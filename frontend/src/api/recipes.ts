import { fetchAPI } from './client';
import type { Recipe } from './types';

export async function getRecipes(): Promise<Recipe[]> {
  const { data } = await fetchAPI<Recipe>(
    '/recipes?populate[tags]=true&populate[image]=true&sort=title:asc&pagination[pageSize]=100'
  );
  return data;
}
