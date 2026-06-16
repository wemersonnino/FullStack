'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

async function getFileData(fileName) {
  const filePath = path.join(__dirname, '..', 'data', 'uploads', fileName);
  if (!await fs.exists(filePath)) {
    console.warn(`Arquivo não encontrado: ${filePath}`);
    return null;
  }
  
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

async function uploadFile(strapi, fileName) {
  const fileData = await getFileData(fileName);
  if (!fileData) return null;

  // Check if already exists in the media library
  const existing = await strapi.db.query('plugin::upload.file').findOne({
    where: { name: fileName.replace(/\..*$/, '') }
  });
  if (existing) return existing;

  try {
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
  } catch (error) {
    console.error(`Falha ao fazer upload de ${fileName}:`, error);
    return null;
  }
}

async function runSeedV3(strapi) {
  const data = require('../data/marketing-content-v3.json');

  console.log('--- Iniciando Seed de Marketing V3 (SaaS Gestão Inteligente) ---');

  // 0. Cleanup
  const collectionsToClean = [
    'api::feature-section.feature-section',
    'api::market-segment.market-segment',
    'api::pricing-plan-content.pricing-plan-content',
    'api::article.article',
    'api::landing-page.landing-page'
  ];

  for (const uid of collectionsToClean) {
    try {
        await strapi.db.query(uid).deleteMany({ where: {} });
    } catch (e) {
        console.warn(`Aviso ao limpar ${uid}: ${e.message}`);
    }
  }
  console.log('Dados antigos removidos.');

  // 1. Features
  const featureIds = [];
  for (const feature of data.features) {
    const entry = await strapi.db.query('api::feature-section.feature-section').create({
      data: { ...feature, publishedAt: new Date() }
    });
    featureIds.push(entry.id);
  }
  console.log(`${featureIds.length} Features criadas.`);

  // 2. Market Segments
  const segmentIds = [];
  for (const segment of data.marketSegments) {
    const entry = await strapi.db.query('api::market-segment.market-segment').create({
      data: { ...segment, publishedAt: new Date() }
    });
    segmentIds.push(entry.id);
  }
  console.log(`${segmentIds.length} Segmentos de mercado criados.`);

  // 3. Pricing Plans
  const pricingIds = [];
  for (const plan of data.pricingPlans) {
    const entry = await strapi.db.query('api::pricing-plan-content.pricing-plan-content').create({
      data: { ...plan, publishedAt: new Date() }
    });
    pricingIds.push(entry.id);
  }
  console.log(`${pricingIds.length} Planos de precificação criados.`);

  // 4. Articles
  for (const article of data.articles) {
    const cover = await uploadFile(strapi, article.imageName);
    await strapi.db.query('api::article.article').create({
      data: {
        title: article.title,
        slug: article.slug,
        description: article.description,
        cover: cover ? cover.id : null,
        publishedAt: new Date()
      }
    });
  }
  console.log('Artigos do blog criados.');

  // 5. Landing Pages
  for (const lp of data.landingPages) {
    const heroBg = lp.heroBackgroundImageName ? await uploadFile(strapi, lp.heroBackgroundImageName) : null;
    const sectionBg = lp.sectionBackgroundImageName ? await uploadFile(strapi, lp.sectionBackgroundImageName) : null;

    const entry = await strapi.db.query('api::landing-page.landing-page').create({
      data: {
        ...lp,
        heroBackgroundImage: heroBg ? heroBg.id : null,
        sectionBackgroundImage: sectionBg ? sectionBg.id : null,
        locale: 'pt-BR',
        publishedAt: new Date()
      }
    });

    // Link relations manually via db.query to ensure they are saved
    await strapi.db.query('api::landing-page.landing-page').update({
        where: { id: entry.id },
        data: {
            features: featureIds,
            pricingPlans: pricingIds
        }
    });
    console.log(`Landing Page criada e vinculada: ${lp.slug} (PT-BR) (ID: ${entry.id})`);

    // 5.1 Add English version for home
    if (lp.slug === 'home') {
      try {
        const enEntry = await strapi.db.query('api::landing-page.landing-page').create({
          data: {
            ...lp,
            heroTitle: "Smart Schedule Management for B2B",
            heroDescription: "Eliminate the chaos of manual scheduling with AI, Geofencing, and total compliance.",
            primaryCtaLabel: "Start Free Trial (14 days)",
            secondaryCtaLabel: "Request Demo",
            trialDescription: "Full access for 14 days for your team.",
            locale: 'en',
            publishedAt: new Date()
          }
        });

        await strapi.db.query('api::landing-page.landing-page').update({
            where: { id: enEntry.id },
            data: {
                features: featureIds,
                pricingPlans: pricingIds
            }
        });
        console.log('Versão em inglês (EN) da Home criada e vinculada.');
      } catch (e) {
        console.warn('Não foi possível criar versão EN via db.query:', e.message);
      }
    }
  }

  // 6. Global / Footer
  const existingGlobal = await strapi.db.query('api::global.global').findOne({ where: {} });
  if (!existingGlobal) {
      await strapi.db.query('api::global.global').create({
        data: {
          siteName: "Escala SaaS",
          siteDescription: "Gestão Inteligente de Escalas V3",
          publishedAt: new Date()
        }
      });
  }

  console.log('--- Seed de Marketing V3 Finalizado com Sucesso ---');
}

module.exports = runSeedV3;
