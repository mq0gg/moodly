import type { Core } from '@strapi/strapi';

/**
 * ADR-006: the public role may only READ recipes/tags/questions/answers,
 * and only CREATE recipe-suggestions and comments — never read, update, or
 * delete them, and never choose their own status (that's forced server-side
 * in each controller's create()). This runs on every boot so the
 * permissions are part of the codebase, not a manual admin-panel step that
 * a fresh clone or a new environment could silently miss.
 */
const PUBLIC_PERMISSIONS: Record<string, string[]> = {
  'api::tag.tag': ['find', 'findOne'],
  'api::recipe.recipe': ['find', 'findOne'],
  'api::question.question': ['find', 'findOne'],
  'api::answer.answer': ['find', 'findOne'],
  'api::recipe-suggestion.recipe-suggestion': ['create'],
  'api::comment.comment': ['find', 'create'], // find is scoped server-side to approved-only, latest 6 (FR-15)
};

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) {
      strapi.log.warn('Public role not found; skipping permission bootstrap');
      return;
    }

    for (const [uid, actions] of Object.entries(PUBLIC_PERMISSIONS)) {
      for (const action of actions) {
        const existing = await strapi.query('plugin::users-permissions.permission').findOne({
          where: { action: `${uid}.${action}`, role: publicRole.id },
        });

        if (!existing) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: { action: `${uid}.${action}`, role: publicRole.id },
          });
        }
      }
    }

    strapi.log.info('Public role permissions synced (ADR-006)');
  },
};
