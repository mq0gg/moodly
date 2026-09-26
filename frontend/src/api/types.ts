export type TagDimension = 'mood' | 'flavor' | 'caffeine' | 'temperature' | 'time' | 'difficulty';

export type Tag = {
  id: number;
  label: string;
  slug: string;
  dimension: TagDimension;
  reasonPhrase: string;
  weight: number;
};

export type Recipe = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  image: { url: string; alternativeText: string | null } | null;
  prepMinutes: number | null;
  servings: number | null;
  source: 'original' | 'external_api' | 'community';
  attribution: string | null;
  tags: Tag[];
  ingredients: { name: string; amount: number; unit: string | null; note: string | null }[];
  steps: { instruction: string }[];
};
