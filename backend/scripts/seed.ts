/**
 * Seeds Tag, Question/Answer, and a handful of starter Recipes so
 * `docker compose up` gives a working, browsable, quiz-able app with no
 * manual admin-panel work. Safe to run repeatedly (NFR-05): every entity is
 * looked up by its natural key before being created, so re-running never
 * duplicates rows.
 *
 * Run inside the backend container/environment:
 *   npm run seed
 */
import { createStrapi, compileStrapi } from '@strapi/strapi';

type TagSeed = {
  label: string;
  slug: string;
  dimension: 'mood' | 'flavor' | 'caffeine' | 'temperature' | 'time' | 'difficulty';
  reasonPhrase: string;
};

const TAGS: TagSeed[] = [
  { label: 'Cozy', slug: 'mood-cozy', dimension: 'mood', reasonPhrase: 'cozy and comforting' },
  { label: 'Energized', slug: 'mood-energized', dimension: 'mood', reasonPhrase: 'a real pick-me-up' },
  { label: 'Adventurous', slug: 'mood-adventurous', dimension: 'mood', reasonPhrase: 'a little different' },
  { label: 'Relaxed', slug: 'mood-relaxed', dimension: 'mood', reasonPhrase: 'easygoing and smooth' },
  { label: 'Sweet', slug: 'flavor-sweet', dimension: 'flavor', reasonPhrase: 'sweet' },
  { label: 'Bitter', slug: 'flavor-bitter', dimension: 'flavor', reasonPhrase: 'bold and bitter' },
  { label: 'Fruity', slug: 'flavor-fruity', dimension: 'flavor', reasonPhrase: 'fruity' },
  { label: 'Nutty', slug: 'flavor-nutty', dimension: 'flavor', reasonPhrase: 'warm and nutty' },
  { label: 'High Caffeine', slug: 'caffeine-high', dimension: 'caffeine', reasonPhrase: 'a strong caffeine kick' },
  { label: 'Low Caffeine', slug: 'caffeine-low', dimension: 'caffeine', reasonPhrase: 'easy on the caffeine' },
  { label: 'Decaf', slug: 'caffeine-decaf', dimension: 'caffeine', reasonPhrase: 'caffeine-free' },
  { label: 'Hot', slug: 'temp-hot', dimension: 'temperature', reasonPhrase: 'hot' },
  { label: 'Iced', slug: 'temp-iced', dimension: 'temperature', reasonPhrase: 'iced' },
  { label: 'Quick', slug: 'time-quick', dimension: 'time', reasonPhrase: 'quick to make' },
  { label: 'Leisurely', slug: 'time-leisurely', dimension: 'time', reasonPhrase: 'worth taking your time on' },
  { label: 'Easy', slug: 'difficulty-easy', dimension: 'difficulty', reasonPhrase: 'simple to make' },
  { label: 'Involved', slug: 'difficulty-involved', dimension: 'difficulty', reasonPhrase: 'a fun little project' },
];

const QUESTIONS: {
  text: string;
  order: number;
  selectionMode: 'single' | 'multiple';
  answers: { label: string; order: number; tagSlugs: string[] }[];
}[] = [
  {
    text: 'How do you want it?',
    order: 1,
    selectionMode: 'single',
    answers: [
      { label: 'Hot', order: 1, tagSlugs: ['temp-hot'] },
      { label: 'Iced', order: 2, tagSlugs: ['temp-iced'] },
    ],
  },
  {
    text: "What's your mood right now?",
    order: 2,
    selectionMode: 'multiple',
    answers: [
      { label: 'Cozy', order: 1, tagSlugs: ['mood-cozy'] },
      { label: 'Energized', order: 2, tagSlugs: ['mood-energized'] },
      { label: 'Adventurous', order: 3, tagSlugs: ['mood-adventurous'] },
      { label: 'Relaxed', order: 4, tagSlugs: ['mood-relaxed'] },
    ],
  },
  {
    text: 'Sweet or bold?',
    order: 3,
    selectionMode: 'single',
    answers: [
      { label: 'Sweet', order: 1, tagSlugs: ['flavor-sweet'] },
      { label: 'Bold and bitter', order: 2, tagSlugs: ['flavor-bitter'] },
      { label: 'Fruity', order: 3, tagSlugs: ['flavor-fruity'] },
      { label: 'Nutty', order: 4, tagSlugs: ['flavor-nutty'] },
    ],
  },
  {
    text: 'How much caffeine do you want?',
    order: 4,
    selectionMode: 'single',
    answers: [
      { label: 'Give me all of it', order: 1, tagSlugs: ['caffeine-high'] },
      { label: 'A little', order: 2, tagSlugs: ['caffeine-low'] },
      { label: 'None, please', order: 3, tagSlugs: ['caffeine-decaf'] },
    ],
  },
  {
    text: 'How much time do you have?',
    order: 5,
    selectionMode: 'single',
    answers: [
      { label: 'Two minutes', order: 1, tagSlugs: ['time-quick', 'difficulty-easy'] },
      { label: "I've got a while", order: 2, tagSlugs: ['time-leisurely', 'difficulty-involved'] },
    ],
  },
];

const RECIPES: {
  title: string;
  summary: string;
  prepMinutes: number;
  servings: number;
  tagSlugs: string[];
  ingredients: { name: string; amount: number; unit?: string; note?: string }[];
  steps: string[];
}[] = [
  {
    title: 'Iced Vanilla Latte',
    summary: 'A sweet, smooth iced latte with a hint of vanilla.',
    prepMinutes: 5,
    servings: 1,
    tagSlugs: ['temp-iced', 'flavor-sweet', 'caffeine-high', 'time-quick', 'difficulty-easy', 'mood-relaxed'],
    ingredients: [
      { name: 'espresso', amount: 2, unit: 'fl_oz' },
      { name: 'milk', amount: 6, unit: 'fl_oz' },
      { name: 'vanilla syrup', amount: 1, unit: 'tbsp' },
      { name: 'ice', amount: 1, unit: 'cup' },
    ],
    steps: ['Fill a glass with ice.', 'Pour in the milk and vanilla syrup, stir.', 'Top with espresso.'],
  },
  {
    title: 'Classic Hot Americano',
    summary: 'Bold, simple, and quick — just espresso and hot water.',
    prepMinutes: 3,
    servings: 1,
    tagSlugs: ['temp-hot', 'flavor-bitter', 'caffeine-high', 'time-quick', 'difficulty-easy', 'mood-energized'],
    ingredients: [
      { name: 'espresso', amount: 2, unit: 'fl_oz' },
      { name: 'hot water', amount: 6, unit: 'fl_oz' },
    ],
    steps: ['Pull two shots of espresso.', 'Top with hot water.'],
  },
  {
    title: 'Cozy Cinnamon Mocha',
    summary: 'A rich, chocolatey hot drink with a warm cinnamon finish.',
    prepMinutes: 8,
    servings: 1,
    tagSlugs: ['temp-hot', 'flavor-sweet', 'flavor-nutty', 'caffeine-low', 'time-leisurely', 'difficulty-involved', 'mood-cozy'],
    ingredients: [
      { name: 'espresso', amount: 1, unit: 'fl_oz' },
      { name: 'milk', amount: 6, unit: 'fl_oz' },
      { name: 'chocolate syrup', amount: 1, unit: 'tbsp' },
      { name: 'ground cinnamon', amount: 1, unit: 'pinch' },
    ],
    steps: ['Steam the milk with the chocolate syrup.', 'Pour over espresso.', 'Dust with cinnamon.'],
  },
  {
    title: 'Iced Fruity Cold Brew',
    summary: 'Cold brew over ice with a splash of orange for a bright, fruity twist.',
    prepMinutes: 5,
    servings: 1,
    tagSlugs: ['temp-iced', 'flavor-fruity', 'caffeine-high', 'time-quick', 'difficulty-easy', 'mood-adventurous'],
    ingredients: [
      { name: 'cold brew concentrate', amount: 4, unit: 'fl_oz' },
      { name: 'orange juice', amount: 2, unit: 'fl_oz' },
      { name: 'ice', amount: 1, unit: 'cup' },
    ],
    steps: ['Fill a glass with ice.', 'Pour in the cold brew.', 'Top with orange juice, stir gently.'],
  },
  {
    title: 'Decaf Almond Steamer',
    summary: 'A caffeine-free, nutty steamed milk drink — cozy without the buzz.',
    prepMinutes: 6,
    servings: 1,
    tagSlugs: ['temp-hot', 'flavor-nutty', 'caffeine-decaf', 'time-leisurely', 'difficulty-easy', 'mood-relaxed', 'mood-cozy'],
    ingredients: [
      { name: 'decaf espresso', amount: 1, unit: 'fl_oz' },
      { name: 'almond milk', amount: 8, unit: 'fl_oz' },
      { name: 'almond syrup', amount: 1, unit: 'tbsp' },
    ],
    steps: ['Steam the almond milk with the syrup.', 'Pour over decaf espresso.'],
  },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seed() {
  const { appDir, distDir } = await compileStrapi();
  const strapi = await createStrapi({ appDir, distDir }).load();

  const tagIdBySlug: Record<string, number> = {};
  for (const t of TAGS) {
    const existing = await strapi.db.query('api::tag.tag').findOne({ where: { slug: t.slug } });
    const record =
      existing ??
      (await strapi.db.query('api::tag.tag').create({
        data: { label: t.label, slug: t.slug, dimension: t.dimension, reasonPhrase: t.reasonPhrase, weight: 1 },
      }));
    tagIdBySlug[t.slug] = record.id;
  }
  strapi.log.info(`Seeded ${TAGS.length} tags`);

  for (const q of QUESTIONS) {
    let question = await strapi.db.query('api::question.question').findOne({ where: { order: q.order } });
    if (!question) {
      question = await strapi.db.query('api::question.question').create({
        data: { text: q.text, order: q.order, selectionMode: q.selectionMode, isActive: true },
      });
    }

    for (const a of q.answers) {
      const existingAnswer = await strapi.db.query('api::answer.answer').findOne({
        where: { label: a.label, question: question.id },
      });
      if (!existingAnswer) {
        await strapi.db.query('api::answer.answer').create({
          data: {
            label: a.label,
            order: a.order,
            question: question.id,
            tags: a.tagSlugs.map((s) => tagIdBySlug[s]),
          },
        });
      }
    }
  }
  strapi.log.info(`Seeded ${QUESTIONS.length} questions`);

  for (const r of RECIPES) {
    const existing = await strapi.db.query('api::recipe.recipe').findOne({ where: { title: r.title } });
    if (!existing) {
      await strapi.entityService.create('api::recipe.recipe', {
        data: {
          title: r.title,
          slug: slugify(r.title),
          summary: r.summary,
          prepMinutes: r.prepMinutes,
          servings: r.servings,
          source: 'original',
          // Strapi's generated type for Recipe.tags incorrectly infers a
          // to-one relation (likely confused by Tag having two separate
          // relations — recipes and answers — that both invert via a field
          // literally named "tags"). Schema is correctly manyToMany; this
          // array is the right runtime shape, matching Answer.tags above.
          tags: r.tagSlugs.map((s) => tagIdBySlug[s]) as unknown as number,
          ingredients: r.ingredients,
          steps: r.steps.map((instruction) => ({ instruction })),
          publishedAt: new Date(),
        },
      });
    }
  }
  strapi.log.info(`Seeded ${RECIPES.length} starter recipes (target: 30+ total by v0.1, see B-11)`);

  await strapi.destroy();
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});