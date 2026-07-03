This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Strapi tokens

Para endurecer o acesso ao CMS no ambiente server-side:

- `STRAPI_API_TOKEN_READ_ONLY`: token do tipo `Read-only` para leituras editoriais feitas pelo servidor Next.js.
- `STRAPI_API_TOKEN_UPLOAD`: token separado para upload de imagens no Strapi. Prefira `Custom` com permissão apenas no plugin de upload, em vez de `Full access`.

Recomendação operacional:

- nunca expor esses tokens no navegador ou em variáveis `NEXT_PUBLIC_*`;
- manter uploads somente via rotas BFF autenticadas;
- se as coleções editoriais deixarem de ser públicas no Strapi, as leituras SSR continuarão funcionando via token read-only.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
