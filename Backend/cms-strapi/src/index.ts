import type { Core } from '@strapi/strapi';

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
  'api::global.global.find',
  'api::menu.menu.find',
  'api::menu.menu.findOne',
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
  const now = new Date();

  const global = await strapi.db.query('api::global.global').findOne({ where: {} });
  if (!global) {
    await strapi.db.query('api::global.global').create({
      data: {
        siteName: 'Plataforma Escala',
        siteDescription: 'Gestao de escalas, trocas e equipes.',
        publishedAt: now,
      },
    });
  }

  const footer = await strapi.db.query('api::footer.footer').findOne({ where: {} });
  if (!footer) {
    await strapi.db.query('api::footer.footer').create({
      data: {
        description: 'Plataforma para organizar escalas de trabalho com seguranca.',
        copyright: `(c) ${now.getFullYear()} Plataforma Escala`,
        publishedAt: now,
      },
    });
  }

  const menuCount = await strapi.db.query('api::menu.menu').count({
    where: { location: 'header' },
  });
  if (menuCount === 0) {
    await strapi.db.query('api::menu.menu').createMany({
      data: [
        {
          title: 'Inicio',
          slug: 'inicio',
          destination: '/',
          location: 'header',
          linkType: 'internal',
          order: 1,
          active: true,
          publishedAt: now,
        },
        {
          title: 'Artigos',
          slug: 'artigos',
          destination: '/#artigos',
          location: 'header',
          linkType: 'internal',
          order: 2,
          active: true,
          publishedAt: now,
        },
      ],
    });
  }

  const category = await strapi.db.query('api::category.category').findOne({
    where: { slug: 'gestao-de-escalas' },
  });
  if (!category) {
    await strapi.db.query('api::category.category').create({
      data: {
        name: 'Gestao de Escalas',
        slug: 'gestao-de-escalas',
        description: 'Conteudos sobre organizacao de escalas.',
        publishedAt: now,
      },
    });
  }

  const author = await strapi.db.query('api::author.author').findOne({
    where: { email: 'conteudo@escala.local' },
  });
  if (!author) {
    await strapi.db.query('api::author.author').create({
      data: {
        name: 'Equipe Escala',
        email: 'conteudo@escala.local',
        publishedAt: now,
      },
    });
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await syncPublicReadPermissions(strapi);
    await seedCmsContent(strapi);
  },
};
