export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(','),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // Rate limiting for the public create-only endpoints (RecipeSuggestion,
  // Comment) is added in B-19 (v0.3) — a rate-limit plugin/middleware
  // scoped to those two routes, not applied globally here.
];
