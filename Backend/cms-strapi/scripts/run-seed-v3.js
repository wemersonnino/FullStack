'use strict';

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const runSeedV3 = require('./seed-marketing-v3');

  console.log('Iniciando bootstrap do Strapi para execução de Seed V3...');
  
  try {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    
    // Suprime logs excessivos durante o seed
    app.log.level = 'error';

    await runSeedV3(app);
    
    await app.destroy();
    console.log('Seed V3 executado com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro crítico na execução do Seed V3:', error);
    process.exit(1);
  }
}

main();
