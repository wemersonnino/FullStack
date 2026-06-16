import type { Core } from '@strapi/strapi';
import path from 'path';

const PUBLIC_READ_ACTIONS = [
  'api::about.about.find',
  'api::announcement.announcement.find',
  'api::announcement.announcement.findOne',
  'api::article.article.find',
  'api::article.article.findOne',
  'api::author.author.find',
  'api::author.author.findOne',
  'api::banner.banner.find',
  'api::banner.banner.findOne',
  'api::calendar-event.calendar-event.find',
  'api::calendar-event.calendar-event.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::footer.footer.find',
  'api::cta-button.cta-button.find',
  'api::cta-button.cta-button.findOne',
  'api::faq.faq.find',
  'api::faq.faq.findOne',
  'api::feature-section.feature-section.find',
  'api::feature-section.feature-section.findOne',
  'api::global.global.find',
  'api::industry-section.industry-section.find',
  'api::industry-section.industry-section.findOne',
  'api::landing-page.landing-page.find',
  'api::landing-page.landing-page.findOne',
  'api::market-segment.market-segment.find',
  'api::market-segment.market-segment.findOne',
  'api::plan-feature-group.plan-feature-group.find',
  'api::campaign-page.campaign-page.find',
  'api::lead-form.lead-form.find',
  'api::legal-page.legal-page.find',
  'api::testimonial.testimonial.find',
  'api::email-template-content.email-template-content.find',
  'api::menu.menu.find',
  'api::menu.menu.findOne',
  'api::pricing-plan-content.pricing-plan-content.find',
  'api::pricing-plan-content.pricing-plan-content.findOne',
];

function setActionEnabled(permissions: any, action: string, enabled: boolean) {
  const [type, controller, actionName] = action.split('.');
  const current = permissions?.[type]?.controllers?.[controller]?.[actionName];
  if (current) {
    current.enabled = enabled;
    current.policy = current.policy || '';
  }
}

async function syncPublicReadPermissions(strapi: Core.Strapi) {
  const roleService = strapi.plugin('users-permissions').service('role');
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) return;

  const role = await roleService.findOne(publicRole.id);
  Object.values(role.permissions).forEach((permissionGroup: any) => {
    Object.values(permissionGroup.controllers || {}).forEach((controller: any) => {
      Object.values(controller).forEach((action: any) => {
        action.enabled = false;
        action.policy = action.policy || '';
      });
    });
  });

  for (const action of PUBLIC_READ_ACTIONS) {
    setActionEnabled(role.permissions, action, true);
  }

  await roleService.updateRole(publicRole.id, {
    name: publicRole.name,
    description: publicRole.description,
    permissions: role.permissions,
  });
}

async function seedCmsContent(strapi: Core.Strapi) {
  // Not needed if we run V3 seed
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await syncPublicReadPermissions(strapi);

    // Seed Marketing V3 Content
    try {
      // @ts-ignore
      const seedFunc = require(path.join(process.cwd(), 'scripts', 'seed-marketing-v3'));
      if (typeof seedFunc === 'function') {
        await seedFunc(strapi);
      }
    } catch (e) {
      console.error('Falha ao rodar Seed V3:', e);
    }

    try {
      // @ts-ignore
      const checkData = require(path.join(process.cwd(), 'scripts', 'check-data'));
      await checkData(strapi);
    } catch (e) {}
  },
};
