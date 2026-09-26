/**
 * B-10: imports recipes into Strapi from TheCocktailDB's free API, instead
 * of proxying it live (ADR-004) — so quota limits or an outage on their end
 * can never break the quiz. Only their "Non_Alcoholic" filter is used: this
 * covers fresh, halal-friendly drinks (smoothies, lassis, lemonades,
 * masala chai, iced coffee/tea) but NOT matcha specifically and not most
 * espresso-based coffee drinks — those stay hand-seeded in seed.ts as
 * source "original". This script is one supplementary source among others,
 * not a replacement for it.
 *
 * Uses the developer test key "1", which TheCocktailDB's own docs say is
 * fine for development or educational use (see thecocktaildb.com/api.php).
 * If this project is ever released as a public production app rather than
 * a student portfolio piece, that page's terms call for a paid production
 * key instead — worth revisiting at that point (flagged as an open item,
 * not handled here).
 *
 * Safe to re-run (NFR-05): every drink is looked up by its TheCocktailDB
 * id (stored as externalId) before being created, so re-running never
 * duplicates a recipe or re-uploads its image.
 *
 * Run inside the backend container/environment:
 *   npm run import:external
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createStrapi, compileStrapi } from '@strapi/strapi';

const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1';
const ATTRIBUTION = 'TheCocktailDB (https://www.thecocktaildb.com)';

// How many non-alcoholic drinks to import in this batch. TheCocktailDB's
// free filter.php returns the full list in one call; this just caps how
// many we pull in per run, to keep a first run quick and reviewable.
const IMPORT_LIMIT = 15;

type CocktailDbSummary = { strDrink: string; strDrinkThumb: string; idDrink: string };
type CocktailDbDetail = {
  idDrink: string;
  strDrink: string;
  strInstructions: string;
  strDrinkThumb: string;
  strCategory: string | null;
  [key: `strIngredient${number}`]: string | null;
  [key: `strMeasure${number}`]: string | null;
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request to ${url} failed with ${res.status}`);
  return res.json() as Promise<T>;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Best-effort split of a free-text measure like "1 1/2 oz" into a
 * decimal amount plus the remaining unit text, which is kept verbatim in
 * `note` so nothing from the source is silently dropped even when the
 * amount can't be parsed cleanly. */
function parseMeasure(measure: string): { amount: number; note: string } {
  const trimmed = measure.trim();
  const match = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)|^(\d+)\/(\d+)|^(\d+(?:\.\d+)?)/);
  if (!match) return { amount: 1, note: trimmed };

  let amount: number;
  if (match[1] && match[2] && match[3]) {
    amount = Number(match[1]) + Number(match[2]) / Number(match[3]);
  } else if (match[4] && match[5]) {
    amount = Number(match[4]) / Number(match[5]);
  } else {
    amount = Number(match[6]);
  }

  const rest = trimmed.slice(match[0].length).trim();
  return { amount: Math.round(amount * 100) / 100, note: rest || trimmed };
}

/** Splits TheCocktailDB's free-text instructions into individual steps. */
function splitSteps(instructions: string): string[] {
  return instructions
    .split(/(?<=[.!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Very small heuristic tagger — good enough to make an imported recipe
 * immediately usable in the quiz, not a substitute for the owner
 * reviewing tags in the admin afterward. */
function inferTagSlugs(detail: CocktailDbDetail, ingredientCount: number): string[] {
  const text = `${detail.strDrink} ${detail.strInstructions}`.toLowerCase();
  const slugs: string[] = ['caffeine-decaf']; // non-alcoholic drinks here are never caffeinated cocktails

  slugs.push(/\bhot\b|chocolate|chai|cocoa/.test(text) ? 'temp-hot' : 'temp-iced');

  if (/lemon|lime|berry|fruit|mango|pineapple|orange|banana|apple/.test(text)) slugs.push('flavor-fruity');
  if (/sugar|syrup|honey|sweet/.test(text)) slugs.push('flavor-sweet');
  if (/chocolate|cocoa|almond|coconut/.test(text)) slugs.push('flavor-nutty');

  slugs.push(ingredientCount > 6 ? 'difficulty-involved' : 'difficulty-easy');
  slugs.push(ingredientCount > 6 ? 'time-leisurely' : 'time-quick');

  return slugs;
}

async function uploadThumbnail(strapi: any, url: string, filename: string): Promise<number | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());

    const tmpPath = path.join(os.tmpdir(), `moodly-import-${Date.now()}-${filename}`);
    fs.writeFileSync(tmpPath, buffer);

    const uploadService = strapi.plugin('upload').service('upload');
    const [uploaded] = await uploadService.upload({
      data: {},
      files: {
        filepath: tmpPath,
        originalFilename: filename,
        mimetype: 'image/jpeg',
        size: buffer.length,
      },
    });

    fs.unlinkSync(tmpPath);
    return uploaded.id as number;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Image upload failed for ${filename}, continuing without it:`, (err as Error).message);
    return null;
  }
}

async function importExternal() {
  const { appDir, distDir } = await compileStrapi();
  const strapi = await createStrapi({ appDir, distDir }).load();

  const tagIdBySlug: Record<string, number> = {};
  const allTags = await strapi.db.query('api::tag.tag').findMany({ limit: 100 });
  for (const tag of allTags) tagIdBySlug[tag.slug] = tag.id;

  const { drinks } = await fetchJSON<{ drinks: CocktailDbSummary[] | null }>(
    `${API_BASE}/filter.php?a=Non_Alcoholic`
  );
  if (!drinks) {
    strapi.log.warn('TheCocktailDB returned no non-alcoholic drinks; nothing to import');
    await strapi.destroy();
    process.exit(0);
  }

  const batch = drinks.slice(0, IMPORT_LIMIT);
  let imported = 0;
  let skipped = 0;

  for (const summary of batch) {
    const existing = await strapi.db
      .query('api::recipe.recipe')
      .findOne({ where: { externalId: summary.idDrink } });
    if (existing) {
      skipped++;
      continue;
    }

    const { drinks: detailDrinks } = await fetchJSON<{ drinks: CocktailDbDetail[] }>(
      `${API_BASE}/lookup.php?i=${summary.idDrink}`
    );
    const detail = detailDrinks?.[0];
    if (!detail) continue;

    const ingredients: { name: string; amount: number; note: string }[] = [];
    for (let i = 1; i <= 15; i++) {
      const name = detail[`strIngredient${i}`];
      const measure = detail[`strMeasure${i}`];
      if (!name) continue;
      const parsed = measure ? parseMeasure(measure) : { amount: 1, note: '' };
      ingredients.push({ name, amount: parsed.amount, note: parsed.note });
    }

    const imageId = await uploadThumbnail(strapi, detail.strDrinkThumb, `${slugify(detail.strDrink)}.jpg`);
    const tagSlugs = inferTagSlugs(detail, ingredients.length);
    const tagIds = tagSlugs.map((s) => tagIdBySlug[s]).filter((id): id is number => id !== undefined);

    await strapi.entityService.create('api::recipe.recipe', {
      data: {
        title: detail.strDrink,
        slug: slugify(detail.strDrink),
        summary: detail.strInstructions.slice(0, 150) + (detail.strInstructions.length > 150 ? '…' : ''),
        prepMinutes: 5,
        servings: 1,
        source: 'external_api',
        externalId: detail.idDrink,
        attribution: ATTRIBUTION,
        image: imageId ?? undefined,
        tags: tagIds as unknown as number,
        ingredients,
        steps: splitSteps(detail.strInstructions).map((instruction) => ({ instruction })),
        publishedAt: new Date(),
      },
    });

    imported++;
  }

  strapi.log.info(`Imported ${imported} recipes from TheCocktailDB, skipped ${skipped} already present`);
  strapi.log.info('Review imported recipes\u2019 tags in the admin — auto-tagging is best-effort, not exact.');

  await strapi.destroy();
  process.exit(0);
}

importExternal().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Import failed:', err);
  process.exit(1);
});
