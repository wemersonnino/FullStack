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
    'api::testimonial.testimonial',
    'api::banner.banner',
    'api::announcement.announcement',
    'api::lead-form.lead-form',
    'api::legal-page.legal-page',
    'api::landing-page.landing-page',
    'api::contact-content.contact-content',
    'api::global.global',
    'api::footer.footer',
    'api::campaign-page.campaign-page',
    'api::email-template-content.email-template-content'
  ];

  for (const uid of collectionsToClean) {
    try {
        await strapi.db.query(uid).deleteMany({ where: {} });
    } catch (e) {
        console.warn(`Aviso ao limpar ${uid}: ${e.message}`);
    }
  }
  console.log('Dados antigos removidos.');

  // Helper para criar documento via Document Service (Strapi v5)
  const createDoc = async (uid, data) => {
    return await strapi.documents(uid).create({
      data: data,
      status: 'published'
    });
  };

  // 1. Features
  const featureDocIds = [];
  for (const feature of data.features) {
    const entry = await createDoc('api::feature-section.feature-section', { ...feature, locale: 'pt-BR' });
    featureDocIds.push(entry.documentId);
  }
  console.log(`${featureDocIds.length} Features criadas.`);

  // 2. Industry Sections
  const industryDocIds = [];
  const industries = data.industries?.length ? data.industries : marketingContent.industries || [];
  for (const [index, industry] of industries.entries()) {
    const entry = await createDoc('api::industry-section.industry-section', {
        title: industry.title,
        segment: industry.segment || 'other',
        valueProposition: industry.valueProposition || industry.description,
        description: industry.description || '',
        highlightMetric: industry.highlightMetric || '',
        order: index,
        active: true,
        locale: 'pt-BR'
    });
    industryDocIds.push(entry.documentId);
  }
  console.log(`${industryDocIds.length} Segmentos editoriais criados.`);

  // 3. Market Segments
  const segmentDocIds = [];
  for (const segment of data.marketSegments) {
    const entry = await createDoc('api::market-segment.market-segment', { ...segment, locale: 'pt-BR' });
    segmentDocIds.push(entry.documentId);
  }
  console.log(`${segmentDocIds.length} Segmentos de mercado criados.`);

  // 4. Pricing Plans
  const pricingDocIds = [];
  for (const [index, plan] of data.pricingPlans.entries()) {
    const entry = await createDoc('api::pricing-plan-content.pricing-plan-content', { ...plan, order: plan.order ?? index, active: plan.active ?? true, locale: 'pt-BR' });
    pricingDocIds.push(entry.documentId);
  }
  console.log(`${pricingDocIds.length} Planos de precificação criados.`);

  // 5. FAQs
  const faqDocIds = [];
  const faqs = data.faqs?.length ? data.faqs : marketingContent.faqs || [];
  for (const [index, faq] of faqs.entries()) {
    const entry = await createDoc('api::faq.faq', {
        ...faq,
        order: faq.order ?? index,
        active: faq.active ?? true,
        locale: 'pt-BR'
    });
    faqDocIds.push(entry.documentId);
  }
  console.log(`${faqDocIds.length} FAQs criadas.`);

  // 6. CTA Buttons
  const ctaDocIds = [];
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
    const entry = await createDoc('api::cta-button.cta-button', {
        ...cta,
        order: index,
        active: true,
        locale: 'pt-BR'
    });
    ctaDocIds.push(entry.documentId);
  }
  console.log(`${ctaDocIds.length} CTAs criados.`);

  // 7. Header Menu
  const headerMenus = [
    { title: 'Funcionalidades', slug: 'funcionalidades', destination: '#modulos', order: 0 },
    { title: 'Setores', slug: 'setores', destination: '#setores', order: 1 },
    { title: 'Planos', slug: 'planos', destination: '#pricing', order: 2 },
    { title: 'Conteúdo', slug: 'conteudo', destination: '#blog', order: 3 }
  ];
  for (const item of headerMenus) {
    await createDoc('api::menu.menu', {
        ...item,
        location: 'header',
        linkType: 'internal',
        iconPosition: 'left',
        active: true
    });
  }
  console.log(`${headerMenus.length} itens de menu do header criados.`);

  // 8. Articles
  for (const article of data.articles) {
    const cover = await uploadFile(strapi, article.imageName);
    await createDoc('api::article.article', {
        title: article.title,
        slug: article.slug,
        description: article.description,
        cover: cover ? cover.id : null
    });
  }
  console.log('Artigos do blog criados.');

  // 9. Testimonials
  for (const testimonial of data.testimonials || []) {
    await createDoc('api::testimonial.testimonial', {
      ...testimonial,
      locale: 'pt-BR'
    });
  }
  console.log(`${(data.testimonials || []).length} depoimentos criados.`);

  // 10. Campaign Banners
  for (const banner of data.banners || []) {
    const image = await uploadFile(strapi, banner.imageName);
    await createDoc('api::banner.banner', {
      title: banner.title,
      description: banner.description,
      image: image ? image.id : null,
    });
  }
  console.log(`${(data.banners || []).length} banners criados.`);

  // 11. Announcements
  for (const announcement of data.announcements || []) {
    const image = announcement.imageName ? await uploadFile(strapi, announcement.imageName) : null;
    await createDoc('api::announcement.announcement', {
      title: announcement.title,
      slug: announcement.slug,
      content: announcement.content,
      category: announcement.category || 'update',
      image: image ? image.id : null,
    });
  }
  console.log(`${(data.announcements || []).length} comunicados criados.`);

  // 12. Lead Forms
  for (const leadForm of data.leadForms || []) {
    await createDoc('api::lead-form.lead-form', leadForm);
  }
  console.log(`${(data.leadForms || []).length} formularios de lead criados.`);

  // 13. Legal Pages
  for (const legalPage of data.legalPages || []) {
    await createDoc('api::legal-page.legal-page', legalPage);
  }
  console.log(`${(data.legalPages || []).length} paginas legais criadas.`);

  // 13.1 Email Templates
  for (const emailTemplate of data.emailTemplates || []) {
    await createDoc('api::email-template-content.email-template-content', emailTemplate);
  }
  console.log(`${(data.emailTemplates || []).length} templates de email criados.`);

  // 14. Landing Pages
  for (const lp of data.landingPages) {
    const heroBg = lp.heroBackgroundImageName ? await uploadFile(strapi, lp.heroBackgroundImageName) : null;
    const sectionBg = lp.sectionBackgroundImageName ? await uploadFile(strapi, lp.sectionBackgroundImageName) : null;

    const entry = await createDoc('api::landing-page.landing-page', {
        ...lp,
        pageKey: lp.slug === 'home' ? 'home' : 'segment',
        heroBackgroundImage: heroBg ? heroBg.id : null,
        sectionBackgroundImage: sectionBg ? sectionBg.id : null,
        locale: 'pt-BR',
        features: featureDocIds,
        industries: industryDocIds,
        pricingPlans: pricingDocIds,
        faqs: faqDocIds,
        ctaButtons: ctaDocIds
    });

    console.log(`Landing Page criada e vinculada: ${lp.slug} (PT-BR) (DocumentID: ${entry.documentId})`);

    // 5.1 Add English version for home
    if (lp.slug === 'home') {
      try {
        const enEntry = await createDoc('api::landing-page.landing-page', {
            ...lp,
            pageKey: "home",
            slug: "home-en",
            heroTitle: "Smart Schedule Management for B2B",
            heroDescription: "Eliminate the chaos of manual scheduling with AI, Geofencing, and total compliance.",
            primaryCtaLabel: "Start Free Trial (14 days)",
            secondaryCtaLabel: "Request Demo",
            trialDescription: "Full access for 14 days for your team.",
            locale: 'en',
            features: featureDocIds,
            industries: industryDocIds,
            pricingPlans: pricingDocIds,
            faqs: faqDocIds,
            ctaButtons: ctaDocIds
        });
        console.log('Versão em inglês (EN) da Home criada e vinculada.');
      } catch (e) {
        console.warn('Não foi possível criar versão EN via documents:', e.message);
      }
    }
  }

  // 13.2 Campaign Pages (Ads)
  for (const campaignPage of data.campaignPages || []) {
    const homeLanding = await strapi.db.query('api::landing-page.landing-page').findOne({
      where: { slug: 'home', locale: 'pt-BR' }
    });
    await createDoc('api::campaign-page.campaign-page', {
      ...campaignPage,
      landingPage: homeLanding ? homeLanding.id : null
    });
  }
  console.log(`${(data.campaignPages || []).length} paginas de campanha criadas.`);

  // 11. Contact Content
  await createDoc('api::contact-content.contact-content', {
      title: "Fale Conosco",
      description: "Estamos aqui para ajudar você a otimizar sua gestão de escalas. Escolha o canal de sua preferência ou preencha o formulário.",
      phone1: "+55 (11) 4002-8922",
      phone2: "+55 (31) 98888-7777",
      email: "contato@escala.app",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      faqLinkText: "Dúvidas frequentes? Acesse nossa FAQ",
      locale: 'pt-BR'
  });
  console.log('Conteúdo da página de contato criado.');

  // 12. Global / Footer
  try {
    const logo = await uploadFile(strapi, 'shiftlink-logo-horizontal.png');
    await createDoc('api::global.global', {
        siteName: "SharedLink Escala",
        siteDescription: "Gestão inteligente de escalas mensais, jornada e operação.",
        logo: logo ? logo.id : null
    });
    console.log('Configuração global criada com marca editorial.');
  } catch (err) {
    console.error('Erro ao criar global:', err.message);
  }

  try {
    await createDoc('api::footer.footer', {
        copyright: "© 2026 SharedLink Escala. Todos os direitos reservados.",
        description: "Plataforma para gestão inteligente de escalas mensais, publicação segura e evolução para jornada, banco de horas e IA.",
        links: [
          { label: 'Funcionalidades', url: '#modulos' },
          { label: 'Planos', url: '#pricing' },
          { label: 'Termos de Uso', url: '/legal/terms' },
          { label: 'Privacidade', url: '/legal/privacy' },
          { label: 'Segurança', url: '/legal/security' }
        ]
    });
    console.log('Conteúdo do Footer criado.');
  } catch (err) {
    console.error('Erro ao criar footer:', err.message);
  }

  console.log('--- Seed de Marketing V3 Finalizado com Sucesso ---');
}

module.exports = runSeedV3;
