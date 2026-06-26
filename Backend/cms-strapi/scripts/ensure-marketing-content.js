'use strict';

const path = require('path');
const marketingV3 = require('../data/marketing-content-v3.json');
const marketingContent = require('../data/marketing-content.json');

const REQUIRED_COLLECTIONS = [
  {
    uid: 'api::landing-page.landing-page',
    label: 'landing pages',
    where: { pageKey: 'home' },
  },
  {
    uid: 'api::feature-section.feature-section',
    label: 'feature sections',
    where: {},
  },
  {
    uid: 'api::industry-section.industry-section',
    label: 'industry sections',
    where: {},
  },
  {
    uid: 'api::pricing-plan-content.pricing-plan-content',
    label: 'pricing plans',
    where: {},
  },
  {
    uid: 'api::faq.faq',
    label: 'faqs',
    where: {},
  },
  {
    uid: 'api::menu.menu',
    label: 'header menus',
    where: { location: 'header' },
  },
  {
    uid: 'api::global.global',
    label: 'global settings',
    where: {},
    blocksAutoSeed: false,
  },
  {
    uid: 'api::contact-content.contact-content',
    label: 'contact page',
    where: {},
  },
  {
    uid: 'api::testimonial.testimonial',
    label: 'testimonials',
    where: {},
  },
  {
    uid: 'api::footer.footer',
    label: 'footer',
    where: {},
    blocksAutoSeed: false,
  },
];

function boolEnv(name, defaultValue) {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

async function countEntries(strapi, uid, where) {
  const repository = strapi.db.query(uid);
  if (typeof repository.count === 'function') {
    return repository.count({ where });
  }

  const entries = await repository.findMany({ where, limit: 1 });
  return entries.length;
}

async function backfillLandingPageKeys(strapi) {
  const repository = strapi.db.query('api::landing-page.landing-page');
  const db = strapi.db.connection;
  const preferredHome = await repository.findOne({
    where: { slug: 'landing-page', locale: 'pt-BR' },
    orderBy: { publishedAt: 'desc' },
  });

  if (preferredHome) {
    await db('landing_pages')
      .where({ document_id: preferredHome.documentId })
      .update({ page_key: 'home' });

    await db('landing_pages')
      .whereNot({ document_id: preferredHome.documentId })
      .where({ page_key: 'home', locale: preferredHome.locale })
      .update({ page_key: 'generic' });
    return;
  }

  const existingHome = await repository.findOne({
    where: { slug: 'home', locale: 'pt-BR' },
    orderBy: { publishedAt: 'desc' },
  });

  if (existingHome) {
    await db('landing_pages')
      .where({ document_id: existingHome.documentId })
      .update({ page_key: 'home' });
  }
}

function publishedNow() {
  return new Date();
}

async function findOrCreateByField(strapi, uid, field, value, data) {
  const repository = strapi.db.query(uid);
  const existing = await repository.findOne({
    where: { [field]: value, locale: 'pt-BR' },
    orderBy: { publishedAt: 'desc' },
  });

  if (existing) return existing;

  return repository.create({
    data: {
      ...data,
      locale: 'pt-BR',
      publishedAt: data.publishedAt || publishedNow(),
    },
  });
}

async function ensureFeatureSections(strapi) {
  const entries = [];

  for (const [index, feature] of marketingV3.features.entries()) {
    const entry = await findOrCreateByField(strapi, 'api::feature-section.feature-section', 'title', feature.title, {
      ...feature,
      order: feature.order ?? index,
      active: feature.active ?? true,
    });
    entries.push(entry);
  }

  return entries;
}

async function ensureIndustrySections(strapi) {
  const source = marketingV3.industries?.length ? marketingV3.industries : marketingContent.industries || [];
  const entries = [];

  for (const [index, industry] of source.entries()) {
    const entry = await findOrCreateByField(strapi, 'api::industry-section.industry-section', 'title', industry.title, {
      title: industry.title,
      segment: industry.segment || 'other',
      valueProposition: industry.valueProposition || industry.description,
      description: industry.description || '',
      highlightMetric: industry.highlightMetric || '',
      order: industry.order ?? index,
      active: industry.active ?? true,
    });
    entries.push(entry);
  }

  return entries;
}

async function ensurePricingPlans(strapi) {
  const entries = [];

  for (const [index, plan] of marketingV3.pricingPlans.entries()) {
    const entry = await findOrCreateByField(strapi, 'api::pricing-plan-content.pricing-plan-content', 'name', plan.name, {
      ...plan,
      order: plan.order ?? index,
      active: plan.active ?? true,
    });
    entries.push(entry);
  }

  return entries;
}

async function ensureFaqs(strapi) {
  const source = marketingV3.faqs?.length ? marketingV3.faqs : marketingContent.faqs || [];
  const entries = [];

  for (const [index, faq] of source.entries()) {
    const entry = await findOrCreateByField(strapi, 'api::faq.faq', 'question', faq.question, {
      ...faq,
      order: faq.order ?? index,
      active: faq.active ?? true,
    });
    entries.push(entry);
  }

  return entries;
}

async function ensureCtaButtons(strapi) {
  const home = marketingV3.landingPages?.[0] || {};
  const source = [
    {
      label: home.primaryCtaLabel || 'Começar teste grátis',
      url: home.primaryCtaUrl || '/register',
      variant: 'primary',
      location: 'hero',
    },
    {
      label: home.secondaryCtaLabel || 'Solicitar demonstração',
      url: home.secondaryCtaUrl || '/demo',
      variant: 'outline',
      location: 'hero',
    },
  ];
  const entries = [];

  for (const [index, cta] of source.entries()) {
    const entry = await findOrCreateByField(strapi, 'api::cta-button.cta-button', 'label', cta.label, {
      ...cta,
      order: index,
      active: true,
    });
    entries.push(entry);
  }

  return entries;
}

async function ensureLandingPages(strapi) {
  const entries = [];
  const source = marketingV3.landingPages || [];

  for (const lp of source) {
    const entry = await findOrCreateByField(strapi, 'api::landing-page.landing-page', 'slug', lp.slug, {
      ...lp,
      pageKey: lp.slug === 'home' ? 'home' : 'segment',
    });
    entries.push(entry);
  }

  return entries;
}

async function ensureHeaderMenus(strapi) {
  const source = [
    { title: 'Funcionalidades', slug: 'funcionalidades', destination: '#modulos', order: 0 },
    { title: 'Setores', slug: 'setores', destination: '#setores', order: 1 },
    { title: 'Planos', slug: 'planos', destination: '#pricing', order: 2 },
    { title: 'Conteúdo', slug: 'conteudo', destination: '#blog', order: 3 },
  ];

  const entries = [];
  const repository = strapi.db.query('api::menu.menu');

  for (const item of source) {
    const existing = await repository.findOne({
      where: { slug: item.slug, location: 'header' },
    });

    if (existing) {
      entries.push(existing);
      continue;
    }

    const entry = await repository.create({
      data: {
        ...item,
        location: 'header',
        linkType: 'internal',
        iconPosition: 'left',
        active: true,
      },
    });
    entries.push(entry);
  }

  return entries;
}

async function ensureHomeLandingRelations(strapi, related) {
  const db = strapi.db.connection;
  const homes = await db('landing_pages')
    .select('id')
    .where({ page_key: 'home', locale: 'pt-BR' });

  if (!homes.length) return null;

  for (const home of homes) {
    await syncRelation(db, 'landing_pages_features_lnk', home.id, 'feature_section_id', 'feature_section_ord', related.features.map((entry) => entry.id));
    await syncRelation(db, 'landing_pages_industries_lnk', home.id, 'industry_section_id', 'industry_section_ord', related.industries.map((entry) => entry.id));
    await syncRelation(db, 'landing_pages_pricing_plans_lnk', home.id, 'pricing_plan_content_id', 'pricing_plan_content_ord', related.pricingPlans.map((entry) => entry.id));
    await syncRelation(db, 'landing_pages_faqs_lnk', home.id, 'faq_id', 'faq_ord', related.faqs.map((entry) => entry.id));
    await syncRelation(db, 'landing_pages_cta_buttons_lnk', home.id, 'cta_button_id', 'cta_button_ord', related.ctaButtons.map((entry) => entry.id));
  }

  return homes[0];
}

async function syncRelation(db, tableName, landingPageId, relatedColumn, orderColumn, relatedIds) {
  for (const [index, relatedId] of relatedIds.entries()) {
    const exists = await db(tableName)
      .where({ landing_page_id: landingPageId, [relatedColumn]: relatedId })
      .first('id');

    if (exists) {
      await db(tableName)
        .where({ id: exists.id })
        .update({ [orderColumn]: index + 1 });
      continue;
    }

    await db(tableName).insert({
      landing_page_id: landingPageId,
      [relatedColumn]: relatedId,
      [orderColumn]: index + 1,
    });
  }
}

async function backfillMarketingCollections(strapi, logger) {
  const related = {
    landingPages: await ensureLandingPages(strapi),
    features: await ensureFeatureSections(strapi),
    industries: await ensureIndustrySections(strapi),
    pricingPlans: await ensurePricingPlans(strapi),
    faqs: await ensureFaqs(strapi),
    ctaButtons: await ensureCtaButtons(strapi),
  };

  const menus = await ensureHeaderMenus(strapi);
  const home = await ensureHomeLandingRelations(strapi, related);

  logger.info(
    `[marketing-content:backfill] Conteudo pt-BR garantido: landingPages=${related.landingPages.length}, features=${related.features.length}, industries=${related.industries.length}, pricing=${related.pricingPlans.length}, faqs=${related.faqs.length}, ctas=${related.ctaButtons.length}, menus=${menus.length}${home ? `, home=${home.id}` : ''}.`
  );
}

async function ensureMarketingContent(strapi, options = {}) {
  const source = options.source || 'manual';
  const autoSeedEnabled = boolEnv('STRAPI_AUTO_SEED_MARKETING', true);
  const forceSeed = boolEnv('STRAPI_FORCE_MARKETING_SEED', false);
  const logger = strapi.log || console;

  await backfillLandingPageKeys(strapi);
  await backfillMarketingCollections(strapi, logger);

  if (!autoSeedEnabled && !forceSeed) {
    logger.info(`[marketing-content:${source}] Auto seed desativado por STRAPI_AUTO_SEED_MARKETING=false.`);
    return { seeded: false, reason: 'disabled' };
  }

  const counts = [];
  for (const collection of REQUIRED_COLLECTIONS) {
    const count = await countEntries(strapi, collection.uid, collection.where);
    counts.push({ ...collection, count });
  }

  const total = counts
    .filter((collection) => collection.blocksAutoSeed !== false)
    .reduce((sum, collection) => sum + collection.count, 0);
  const missing = counts.filter((collection) => collection.count === 0);

  if (!forceSeed && missing.length === 0) {
    logger.info(`[marketing-content:${source}] Conteudo base ja existe; seed ignorado.`);
    return { seeded: false, reason: 'already-present', counts };
  }

  if (!forceSeed && total > 0) {
    logger.warn(
      `[marketing-content:${source}] Conteudo CMS parcial detectado (${counts
        .map((collection) => `${collection.label}: ${collection.count}`)
        .join(', ')}). Seed destrutivo nao sera executado automaticamente.`
    );
    return { seeded: false, reason: 'partial-content', counts };
  }

  const runSeedV3 = require(path.join(process.cwd(), 'scripts', 'seed-marketing-v3'));
  await runSeedV3(strapi);

  logger.info(
    `[marketing-content:${source}] Conteudo inicial criado${forceSeed ? ' com STRAPI_FORCE_MARKETING_SEED=true' : ''}.`
  );

  return { seeded: true, reason: forceSeed ? 'forced' : 'empty-cms' };
}

module.exports = ensureMarketingContent;
