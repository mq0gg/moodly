import { fetchAPI } from './client';
import type { Tag } from './types';

export async function getTags(): Promise<Tag[]> {
  const { data } = await fetchAPI<Tag>('/tags?sort=label:asc&pagination[pageSize]=100');
  return data;
}
