# OKRs — Gestao Inteligente de Escalas

Data de referencia: 2026-06-30.

## Visao

Construir um SaaS B2B multi-tenant que substitui planilhas, WhatsApp e controles manuais por uma plataforma segura, auditavel e inteligente para escalas, jornada, banco de horas, ponto, dimensionamento e decisoes operacionais.

O produto deve comecar com uma promessa vendavel e defensavel: sair da planilha e montar uma escala mensal correta, com feriados, contadores, alertas e publicacao segura. Ponto, banco de horas, geolocalizacao e IA devem entrar como expansoes graduais, sempre com o backend Spring Boot como fonte da verdade.

## Estado atual considerado

- Frontend oficial: `Frontend/web-app3/escala`, com Next.js 16, TypeScript, BFF em `app/api/bff`, rotas publicas/privadas, landing, dashboard, escala, relatorios, ReBAC, auditoria e conteudo Strapi.
- Backend oficial: `Backend/java-app1/demo`, com Spring Boot 4.1.0, Java 25, JWT, empresas, usuarios, funcionarios, setores, projetos, escalas, trocas, ponto web basico, marketing leads, auditoria, capacidade operacional, billing e IA mock.
- CMS: `Backend/cms-strapi`, restrito por decisao arquitetural a conteudo, SEO, landing pages, menus, legal pages, formularios editoriais e campanhas.
- Banco: PostgreSQL em Docker, com bancos/usuarios separados para backend e Strapi.
- Estado validado do backend: 24 testes, 0 falhas, suite concentrada no dominio de escala.
- Escala Inteligente ja possui entrega inicial em SSR/BFF/UI com ciclo mensal e editor operacional.
- Mensageria segue parcial: header + modal, sem central dedicada.

## OKR 1 — Reduzir esforco manual na criacao de escalas

**Objetivo:** permitir que empresas pequenas e medias montem escalas mensais em minutos, com base em templates e regras configuraveis.

**Resultados-chave:**

- KR1: gerar calendario mensal automatico para 100% dos meses do ano, incluindo meses com 28, 29, 30 e 31 dias.
- KR2: suportar templates 5x2, 6x1 e 12x36 no MVP operacional, com base backend.
- KR3: reduzir em 70% o tempo manual de criacao de uma escala mensal em teste piloto.
- KR4: calcular automaticamente dias trabalhados, ausentes, descansos, feriados trabalhados, fins de semana trabalhados e horas previstas por colaborador.
- KR5: publicar escala versionada com audit log de quem alterou, quando alterou, motivo e valores relevantes antes/depois.

## OKR 2 — Reduzir riscos trabalhistas e operacionais

**Objetivo:** transformar regras criticas de jornada em validacoes backend auditaveis.

**Resultados-chave:**

- KR1: alertar sobre 44h semanais, 10h/dia quando aplicavel, DSR, interjornada, conflito com ferias/ausencias e mais de seis dias consecutivos.
- KR2: impedir publicacao sem ciencia explicita dos alertas criticos.
- KR3: registrar 100% das alteracoes criticas em audit log.
- KR4: reduzir inconsistencias encontradas em revisao manual de escala em 60% no piloto.
- KR5: documentar quais validacoes sao tecnicas e quais exigem parametrizacao juridica por CCT, categoria ou politica interna.

## OKR 3 — Melhorar aquisicao e qualificacao comercial

**Objetivo:** capturar leads B2B com dados suficientes para segmentacao, trial, onboarding e conversao.

**Resultados-chave:**

- KR1: 100% dos formularios publicos capturam UTM, referrer, origem, landing/campanha e data de captura.
- KR2: 100% dos leads possuem segmento e faixa de colaboradores normalizados.
- KR3: identificar emails pessoais em campos de email corporativo, sem bloquear necessariamente o lead.
- KR4: criar recomendacao inicial de plano e template de escala por segmento.
- KR5: registrar consentimentos LGPD com versao de documento, finalidade e timestamp.

## OKR 4 — Criar base para retencao e expansao

**Objetivo:** entregar funcionalidades que reduzem churn e abrem upsell para planos maiores.

**Resultados-chave:**

- KR1: liberar troca de turnos com fluxo de aceite do colega e aprovacao final do gestor.
- KR2: liberar banco de horas basico com saldo positivo, negativo, compensado e expirado.
- KR3: evoluir ponto web basico para check-in, check-out, intervalo, relatorio de presenca e trilha antifraude minima.
- KR4: criar dashboard operacional para gestor com cobertura, conflitos, trocas pendentes e risco de hora extra.
- KR5: medir uso de IA e limites por plano, mantendo sugestoes explicaveis e validacao final no backend.

## OKR 5 — Fortalecer arquitetura e seguranca para SaaS B2B

**Objetivo:** reduzir risco tecnico antes de trial publico e clientes piloto.

**Resultados-chave:**

- KR1: manter o frontend sem acesso direto ao banco e sem regra trabalhista critica no client.
- KR2: garantir que rotas privadas passem pelo BFF e pelo backend com token protegido.
- KR3: reforcar isolamento por tenant/company em repositories, services, BFF e DTOs.
- KR4: alinhar RBAC/ReBAC para Owner, Admin, Manager, HR e Employee sem quebrar fluxos existentes.
- KR5: ampliar testes de integracao para autenticacao, JPA, JWT, endpoints de escala, leads, ponto e auditoria.

## Metricas de produto

- Tempo medio para criar escala mensal.
- Percentual de escalas publicadas sem alerta critico.
- Quantidade de ajustes pos-publicacao.
- Numero de trocas solicitadas, aprovadas, rejeitadas e efetivadas pelo sistema.
- Horas extras previstas x realizadas.
- Saldo medio de banco de horas.
- Taxa de leads com email corporativo.
- Conversao lead -> trial -> pago.
- Uso de templates por segmento.
- Uso de campanhas por UTM, segmento e faixa de colaboradores.
- NPS/CSAT do gestor e do colaborador.

## Marcos de go/no-go

### Go para beta fechado

- Escala mensal 5x2, 6x1 e 12x36 funcional.
- Feriados e contadores funcionando.
- Alertas minimos de backend para jornada e conflitos.
- BFF implementado sem exposicao de token.
- Testes essenciais passando no backend e typecheck/build do frontend validado.
- Auditoria minima para criacao, alteracao, cancelamento e publicacao de escala.

### Go para trial publico

- Cadastro com Google SSO e trial.
- Segmentacao de lead e atribuicao de campanha.
- Onboarding por segmento.
- Logs e auditoria minimos.
- Politicas LGPD, privacidade, termos e consentimento publicadas.
- Documentacao de suporte, rollback e ambiente.
- Limites de plano e uso de IA/ponto controlados pelo backend.
