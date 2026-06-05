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

  // Check if already exists
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

async function main() {
  const data = require('../data/marketing-content.json');

  console.log('--- Iniciando Seed de Marketing Profissional ---');

  // 1. FAQs
  const faqIds = [];
  for (const faq of data.faqs) {
    const entry = await strapi.documents('api::faq.faq').create({
      data: { ...faq, publishedAt: new Date() }
    });
    faqIds.push(entry.id);
    console.log(`FAQ criado: ${faq.question}`);
  }

  // 2. Features
  const featureIds = [];
  for (const feature of data.features) {
    const entry = await strapi.documents('api::feature-section.feature-section').create({
      data: { ...feature, publishedAt: new Date() }
    });
    featureIds.push(entry.id);
    console.log(`Feature criada: ${feature.title}`);
  }

  // 3. Industries
  const industryIds = [];
  for (const industry of data.industries) {
    const entry = await strapi.documents('api::industry-section.industry-section').create({
      data: { ...industry, publishedAt: new Date() }
    });
    industryIds.push(entry.id);
    console.log(`Setor criado: ${industry.title}`);
  }

  // 4. Pricing
  const pricingIds = [];
  for (const plan of data.pricingPlans) {
    const entry = await strapi.documents('api::pricing-plan-content.pricing-plan-content').create({
      data: { ...plan, publishedAt: new Date() }
    });
    pricingIds.push(entry.id);
    console.log(`Plano de Preço criado: ${plan.name}`);
  }

  // 5. Articles (with Images)
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
    console.log(`Artigo criado: ${article.title}`);
  }

  // 6. Landing Page (Single Type)
  await strapi.documents('api::landing-page.landing-page').createOrUpdate({
    data: {
      ...data.landingPage,
      faqs: faqIds,
      features: featureIds,
      industries: industryIds,
      pricingPlans: pricingIds,
      publishedAt: new Date()
    }
  });
  console.log('Landing Page atualizada com sucesso!');

  console.log('--- Seed de Marketing Finalizado ---');
}

module.exports = main;
