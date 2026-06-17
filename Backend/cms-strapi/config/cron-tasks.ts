import path from 'path';
import type { Core } from '@strapi/strapi';

async function ensureMarketingContent({ strapi }: { strapi: Core.Strapi }) {
  try {
    const ensure = require(path.join(process.cwd(), 'scripts', 'ensure-marketing-content'));
    await ensure(strapi, { source: 'cron' });
  } catch (error) {
    strapi.log.error('Falha ao executar cron de conteudo de marketing:', error);
  }
}

async function kronkAutoAnnouncement({ strapi }: { strapi: Core.Strapi }) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const existing = await strapi.db.query('api::announcement.announcement').findOne({
      where: { title: { $contains: `Dica de Eficiência (${today})` } }
    });

    if (!existing) {
      await strapi.db.query('api::announcement.announcement').create({
        data: {
          title: `Dica de Eficiência (${today})`,
          slug: `dica-eficiencia-${today}`,
          content: "Você sabia que escalas geradas via IA reduzem conflitos em até 40%? Revise suas regras de trabalho no dashboard administrativo.",
          category: "update",
          publishedAt: new Date()
        }
      });
      strapi.log.info('[KRONK] Nova dica de eficiência gerada automaticamente.');
    }
  } catch (error) {
    strapi.log.error('Falha no KRONK ao gerar anuncio:', error);
  }
}

export default {
  ensureMarketingContent: {
    task: ensureMarketingContent,
    options: process.env.STRAPI_MARKETING_CRON_RULE || '0 */30 * * * *',
  },
  kronkAutoAnnouncement: {
    task: kronkAutoAnnouncement,
    options: '0 0 * * *', // Every midnight
  },
};
