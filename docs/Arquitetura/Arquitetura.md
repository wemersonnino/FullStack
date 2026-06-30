# Arquitetura

Data: 2026-06-30

Este documento funciona como indice da arquitetura vigente do projeto.

## Componentes oficiais

- Frontend principal: `Frontend/web-app3/escala`
- Backend oficial: `Backend/java-app1/demo`
- CMS editorial: `Backend/cms-strapi`
- Banco e infraestrutura local: `Data/postgres` + `docker-compose.yml`

## Visao geral

```text
Browser
  -> Next.js 16 (SSR + BFF)
    -> Spring Boot 4 / Java 25
      -> PostgreSQL
    -> Strapi v5 (conteudo editorial)
```

## Principios

- o frontend nao acessa banco diretamente
- o backend Spring Boot e a fonte da verdade para autenticacao, autorizacao, negocio e persistencia
- o Strapi fica restrito a conteudo, SEO, menus, campanhas e formularios editoriais
- o BFF do Next.js faz a fronteira entre browser e backend
- o produto evolui como monolito modular orientado a dominio

## Documentos filhos

- [Arquitetura-Frontend.md](./Arquitetura-Frontend.md)
- [Arquitetura-Backend.md](./Arquitetura-Backend.md)
- [Arquitetura-Devops.md](./Arquitetura-Devops.md)
- [Arquitetura-de-Sistema.md](./Arquitetura-de-Sistema.md)
- [Arquitetura-de-Dados.md](./Arquitetura-de-Dados.md)

## Estado atual de produto

- dashboard privado com BFF por dominio
- Escala Inteligente com calendario SSR, ciclo mensal e editor operacional
- mensageria parcial via header/modal
- ReBAC administrativo ja exposto em backend, BFF e UI
- compose local com healthchecks e subida ordenada

## Regra de manutencao

Quando a implementacao divergir da documentacao:

1. corrigir primeiro os documentos canonicos do estado atual
2. refletir impacto em cobertura de rotas, ambientes, API e changelog
3. manter o `OpenApiController` sincronizado com qualquer mudanca REST
