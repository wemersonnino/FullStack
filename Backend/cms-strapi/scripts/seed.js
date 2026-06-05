'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

async function getFileData(fileName) {
  const filePath = path.join('data', 'uploads', fileName);
  if (!await fs.exists(filePath)) return null;
  
  const stats = fs.statSync(filePath);
  const size = stats['size'];
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';

  return {
    filepath: filePath,
    originalFileName: fileName,
    size,
    mimetype: mimeType,
  };
}

async function uploadFile(fileName) {
  const fileData = await getFileData(fileName);
  if (!fileData) return null;

  const existing = await strapi.query('plugin::upload.file').findOne({
    where: { name: fileName.replace(/\..*$/, '') }
  });
  if (existing) return existing;

  const [uploaded] = await strapi.plugin('upload').service('upload').upload({
    files: fileData,
    data: {
      fileInfo: {
        alternativeText: fileName,
        caption: fileName,
        name: fileName.replace(/\..*$/, ''),
      },
    },
  });
  return uploaded;
}

async function setPublicPermissions(newPermissions) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  for (const controller of Object.keys(newPermissions)) {
    const actions = newPermissions[controller];
    for (const action of actions) {
      await strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    }
  }
}

async function seedMarketingData() {
  const data = require('../data/marketing-content.json');
  console.log('--- Iniciando Seed de Marketing Profissional ---');

  await setPublicPermissions({
    faq: ['find', 'findOne'],
    'feature-section': ['find', 'findOne'],
    'industry-section': ['find', 'findOne'],
    'pricing-plan-content': ['find', 'findOne'],
    'landing-page': ['find', 'findOne'],
    article: ['find', 'findOne'],
    global: ['find', 'findOne'],
    menu: ['find', 'findOne'],
  });

  const faqIds = [];
  for (const faq of data.faqs) {
    const entry = await strapi.documents('api::faq.faq').create({
      data: { ...faq, publishedAt: new Date() }
    });
    faqIds.push(entry.id);
  }

  const featureIds = [];
  for (const feature of data.features) {
    const entry = await strapi.documents('api::feature-section.feature-section').create({
      data: { ...feature, publishedAt: new Date() }
    });
    featureIds.push(entry.id);
  }

  const industryIds = [];
  for (const industry of data.industries) {
    const entry = await strapi.documents('api::industry-section.industry-section').create({
      data: { ...industry, publishedAt: new Date() }
    });
    industryIds.push(entry.id);
  }

  const pricingIds = [];
  for (const plan of data.pricingPlans) {
    const entry = await strapi.documents('api::pricing-plan-content.pricing-plan-content').create({
      data: { ...plan, publishedAt: new Date() }
    });
    pricingIds.push(entry.id);
  }

  for (const article of data.articles) {
    const cover = await uploadFile(article.imageName);
    await strapi.documents('api::article.article').create({
      data: {
        title: article.title,
        slug: article.slug,
        description: article.description,
        cover: cover ? cover.id : null,
        publishedAt: new Date()
      }
    });
  }

  const existingLanding = await strapi.documents('api::landing-page.landing-page').findFirst();
  
  if (existingLanding) {
    await strapi.documents('api::landing-page.landing-page').update({
      documentId: existingLanding.documentId,
      data: {
        ...data.landingPage,
        faqs: faqIds,
        features: featureIds,
        industries: industryIds,
        pricingPlans: pricingIds,
        publishedAt: new Date()
      }
    });
  } else {
    await strapi.documents('api::landing-page.landing-page').create({
      data: {
        ...data.landingPage,
        faqs: faqIds,
        features: featureIds,
        industries: industryIds,
        pricingPlans: pricingIds,
        publishedAt: new Date()
      }
    });
  }

  console.log('--- Seed de Marketing Finalizado ---');
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';
  await seedMarketingData();
  await app.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
