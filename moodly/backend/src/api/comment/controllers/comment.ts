import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::comment.comment',
  ({ strapi }) => ({
    async create(ctx) {
      // ADR-006: forced to "pending" server-side — a visitor can never
      // publish a comment directly.
      if (ctx.request.body?.data) {
        ctx.request.body.data.status = 'pending';
      }

      const response = await super.create(ctx);

      strapi
        .plugin('email')
        .service('email')
        .send({
          to: process.env.OWNER_EMAIL,
          subject: 'New Moodly comment awaiting approval',
          text: 'A new experience comment is pending review in the Strapi admin.',
        })
        .catch((err: unknown) => {
          strapi.log.warn('Comment email notification failed', err as Error);
        });

      return response;
    },

    // FR-15: only the latest 6 approved comments are ever public, newest
    // first. The public role's permissions (bootstrap) restrict find/findOne
    // to this controller, and this filter is enforced regardless of what
    // query params a client sends.
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        filters: { status: 'approved' },
        sort: { createdAt: 'desc' },
        pagination: { limit: 6 },
      };
      return super.find(ctx);
    },
  })
);
