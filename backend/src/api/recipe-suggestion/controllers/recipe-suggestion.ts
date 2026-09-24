import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::recipe-suggestion.recipe-suggestion',
  ({ strapi }) => ({
    async create(ctx) {
      // ADR-006: the public role can create suggestions, but never choose
      // their own status. A visitor's request always lands as "new",
      // whatever the client sends.
      if (ctx.request.body?.data) {
        ctx.request.body.data.status = 'new';
      }

      const response = await super.create(ctx);

      // Fire-and-forget owner notification (never blocks the visitor's
      // response). Wire an actual provider in config/plugins.ts (B-20).
      strapi
        .plugin('email')
        .service('email')
        .send({
          to: process.env.OWNER_EMAIL,
          subject: 'New Moodly recipe suggestion',
          text: `A new recipe suggestion "${response?.data?.title ?? ''}" was submitted. Review it in the Strapi admin.`,
        })
        .catch((err: unknown) => {
          strapi.log.warn('Suggestion email notification failed', err as Error);
        });

      return response;
    },
  })
);
