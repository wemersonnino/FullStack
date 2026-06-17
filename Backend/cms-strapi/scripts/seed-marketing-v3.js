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
  const marketingContent = require('../data/marketing-content.json');

  console.log('--- Iniciando Seed de Marketing V3 (SaaS Gestão Inteligente) ---');

  // 0. Cleanup
  const collectionsToClean = [
    'api::feature-section.feature-section',
    'api::industry-section.industry-section',
    'api::market-segment.market-segment',
    'api::pricing-plan-content.pricing-plan-content',
    'api::faq.faq',
    'api::cta-button.cta-button',
    'api::menu.menu',
    'api::article.article',
    'api::landing-page.landing-page',
    'api::contact-content.contact-content'
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
      data: { ...feature, locale: 'pt-BR', publishedAt: new Date() }
    });
    featureIds.push(entry.id);
  }
  console.log(`${featureIds.length} Features criadas.`);

  // 2. Industry Sections
  const industryIds = [];
  const industries = data.industries?.length ? data.industries : marketingContent.industries || [];
  for (const [index, industry] of industries.entries()) {
    const entry = await strapi.db.query('api::industry-section.industry-section').create({
      data: {
        title: industry.title,
        segment: industry.segment || 'other',
        valueProposition: industry.valueProposition || industry.description,
        description: industry.description || '',
        highlightMetric: industry.highlightMetric || '',
        order: index,
        active: true,
        locale: 'pt-BR',
        publishedAt: new Date()
      }
    });
    industryIds.push(entry.id);
  }
  console.log(`${industryIds.length} Segmentos editoriais criados.`);

  // 3. Market Segments
  const segmentIds = [];
  for (const segment of data.marketSegments) {
    const entry = await strapi.db.query('api::market-segment.market-segment').create({
      data: { ...segment, locale: 'pt-BR', publishedAt: new Date() }
    });
    segmentIds.push(entry.id);
  }
  console.log(`${segmentIds.length} Segmentos de mercado criados.`);

  // 4. Pricing Plans
  const pricingIds = [];
  for (const [index, plan] of data.pricingPlans.entries()) {
    const entry = await strapi.db.query('api::pricing-plan-content.pricing-plan-content').create({
      data: { ...plan, order: plan.order ?? index, active: plan.active ?? true, locale: 'pt-BR', publishedAt: new Date() }
    });
    pricingIds.push(entry.id);
  }
  console.log(`${pricingIds.length} Planos de precificação criados.`);

  // 5. FAQs
  const faqIds = [];
  const faqs = data.faqs?.length ? data.faqs : marketingContent.faqs || [];
  for (const [index, faq] of faqs.entries()) {
    const entry = await strapi.db.query('api::faq.faq').create({
      data: {
        ...faq,
        order: faq.order ?? index,
        active: faq.active ?? true,
        locale: 'pt-BR',
        publishedAt: new Date()
      }
    });
    faqIds.push(entry.id);
  }
  console.log(`${faqIds.length} FAQs criadas.`);

  // 6. CTA Buttons
  const ctaIds = [];
  const ctas = [
    {
      label: data.landingPages?.[0]?.primaryCtaLabel || 'Começar teste grátis',
      url: data.landingPages?.[0]?.primaryCtaUrl || '/register',
      variant: 'primary',
      location: 'hero'
    },
    {
      label: data.landingPages?.[0]?.secondaryCtaLabel || 'Solicitar demonstração',
      url: data.landingPages?.[0]?.secondaryCtaUrl || '/demo',
      variant: 'outline',
      location: 'hero'
    }
  ];
  for (const [index, cta] of ctas.entries()) {
    const entry = await strapi.db.query('api::cta-button.cta-button').create({
      data: {
        ...cta,
        order: index,
        active: true,
        locale: 'pt-BR',
        publishedAt: new Date()
      }
    });
    ctaIds.push(entry.id);
  }
  console.log(`${ctaIds.length} CTAs criados.`);

  // 7. Header Menu
  const headerMenus = [
    { title: 'Funcionalidades', slug: 'funcionalidades', destination: '#modulos', order: 0 },
    { title: 'Setores', slug: 'setores', destination: '#setores', order: 1 },
    { title: 'Planos', slug: 'planos', destination: '#pricing', order: 2 },
    { title: 'Conteúdo', slug: 'conteudo', destination: '#blog', order: 3 }
  ];
  for (const item of headerMenus) {
    await strapi.db.query('api::menu.menu').create({
      data: {
        ...item,
        location: 'header',
        linkType: 'internal',
        iconPosition: 'left',
        active: true
      }
    });
  }
  console.log(`${headerMenus.length} itens de menu do header criados.`);

  // 8. Articles
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

  // 9. Landing Pages
  for (const lp of data.landingPages) {
    const heroBg = lp.heroBackgroundImageName ? await uploadFile(strapi, lp.heroBackgroundImageName) : null;
    const sectionBg = lp.sectionBackgroundImageName ? await uploadFile(strapi, lp.sectionBackgroundImageName) : null;

    const entry = await strapi.db.query('api::landing-page.landing-page').create({
      data: {
        ...lp,
        pageKey: lp.slug === 'home' ? 'home' : 'segment',
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
            industries: industryIds,
            pricingPlans: pricingIds,
            faqs: faqIds,
            ctaButtons: ctaIds
        }
    });
    console.log(`Landing Page criada e vinculada: ${lp.slug} (PT-BR) (ID: ${entry.id})`);

    // 5.1 Add English version for home
    if (lp.slug === 'home') {
      try {
        const enEntry = await strapi.db.query('api::landing-page.landing-page').create({
          data: {
            ...lp,
            pageKey: "home",
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
                industries: industryIds,
                pricingPlans: pricingIds,
                faqs: faqIds,
                ctaButtons: ctaIds
            }
        });
        console.log('Versão em inglês (EN) da Home criada e vinculada.');
      } catch (e) {
        console.warn('Não foi possível criar versão EN via db.query:', e.message);
      }
    }
  }

  // 10. Contact Content
  await strapi.db.query('api::contact-content.contact-content').create({
    data: {
      title: "Fale Conosco",
      description: "Estamos aqui para ajudar você a otimizar sua gestão de escalas. Escolha o canal de sua preferência ou preencha o formulário.",
      phone1: "+55 (11) 4002-8922",
      phone2: "+55 (31) 98888-7777",
      email: "contato@escala.app",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      faqLinkText: "Dúvidas frequentes? Acesse nossa FAQ",
      locale: 'pt-BR',
      publishedAt: new Date()
    }
  });
  console.log('Conteúdo da página de contato criado.');

  // 11. Global / Footer
  try {
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
  } catch (err) {
    console.error('Erro ao criar global:', err.message);
  }

  try {
    const existingFooter = await strapi.db.query('api::footer.footer').findOne({ where: {} });
    console.log('existingFooter:', existingFooter);
    if (!existingFooter) {
        await strapi.db.query('api::footer.footer').create({
          data: {
            copyright: "© 2026 Escala Plataforma SaaS. Todos os direitos reservados.",
            description: "A plataforma líder em gestão inteligente de escalas e conformidade trabalhista.",
            publishedAt: new Date()
          }
        });
        console.log('Conteúdo do Footer criado.');
    }
  } catch (err) {
    console.error('Erro ao criar footer:', err.message);
  }

  console.log('--- Seed de Marketing V3 Finalizado com Sucesso ---');
}

module.exports = runSeedV3;
