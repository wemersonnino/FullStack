'use strict';

async function checkData(strapi) {
  try {
    const lps = await strapi.documents('api::landing-page.landing-page').findMany({
      status: 'published',
      locale: 'all'
    });
    console.log('--- Landing Pages ---');
    lps.forEach(lp => {
      console.log(`ID: ${lp.id}, DocumentID: ${lp.documentId}, Locale: ${lp.locale}, Slug: ${lp.slug}, Title: ${lp.heroTitle}`);
    });
    
    const locales = await strapi.db.query('plugin::i18n.locale').findMany();
    console.log('--- Enabled Locales ---');
    locales.forEach(l => console.log(`${l.code} (${l.name})`));
  } catch (e) {
    console.error(e);
  }
}

module.exports = checkData;
