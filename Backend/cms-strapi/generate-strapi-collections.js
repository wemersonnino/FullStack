const fs = require('fs');
const path = require('path');

const apisToCreate = [
  'market-segment',
  'plan-feature-group',
  'campaign-page',
  'lead-form',
  'legal-page',
  'testimonial',
  'email-template-content'
];

const basePath = path.join(__dirname, 'src', 'api');

apisToCreate.forEach(apiName => {
  const apiPath = path.join(basePath, apiName);
  
  // Create folders
  ['content-types', 'controllers', 'routes', 'services'].forEach(folder => {
    fs.mkdirSync(path.join(apiPath, folder, folder === 'content-types' ? apiName : ''), { recursive: true });
  });

  // schema.json
  const schemaPath = path.join(apiPath, 'content-types', apiName, 'schema.json');
  const schema = {
    kind: 'collectionType',
    collectionName: `${apiName.replace(/-/g, '_')}s`,
    info: {
      singularName: apiName,
      pluralName: `${apiName}s`,
      displayName: apiName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    },
    options: { draftAndPublish: true },
    pluginOptions: {},
    attributes: {
      title: { type: 'string' },
      slug: { type: 'uid', targetField: 'title' }
    }
  };
  // Customize attributes based on the apiName
  if (apiName === 'campaign-page') {
    schema.attributes.startDate = { type: 'datetime' };
    schema.attributes.endDate = { type: 'datetime' };
    schema.attributes.channel = { type: 'string' };
    schema.attributes.landingPage = { type: 'relation', relation: 'oneToOne', target: 'api::landing-page.landing-page' };
  }
  if (apiName === 'market-segment') {
    schema.attributes.description = { type: 'text' };
  }
  if (apiName === 'plan-feature-group') {
    schema.attributes.features = { type: 'json' };
  }
  if (apiName === 'lead-form') {
    schema.attributes.formId = { type: 'string' };
    schema.attributes.fields = { type: 'json' };
  }
  if (apiName === 'legal-page') {
    schema.attributes.content = { type: 'richtext' };
  }
  if (apiName === 'testimonial') {
    schema.attributes.authorName = { type: 'string' };
    schema.attributes.authorRole = { type: 'string' };
    schema.attributes.content = { type: 'text' };
  }
  if (apiName === 'email-template-content') {
    schema.attributes.subject = { type: 'string' };
    schema.attributes.body = { type: 'richtext' };
  }

  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));

  // controller
  const controllerPath = path.join(apiPath, 'controllers', `${apiName}.ts`);
  fs.writeFileSync(controllerPath, `import { factories } from '@strapi/strapi';\n\nexport default factories.createCoreController('api::${apiName}.${apiName}');\n`);

  // route
  const routePath = path.join(apiPath, 'routes', `${apiName}.ts`);
  fs.writeFileSync(routePath, `import { factories } from '@strapi/strapi';\n\nexport default factories.createCoreRouter('api::${apiName}.${apiName}');\n`);

  // service
  const servicePath = path.join(apiPath, 'services', `${apiName}.ts`);
  fs.writeFileSync(servicePath, `import { factories } from '@strapi/strapi';\n\nexport default factories.createCoreService('api::${apiName}.${apiName}');\n`);
});

console.log('Strapi collections created successfully!');
