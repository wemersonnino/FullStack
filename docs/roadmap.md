# Roadmap — Gestao Inteligente de Escalas

Data de referencia: 2026-06-25.

## Estrategia de entrega

O roadmap prioriza uma entrada de Oceano Azul: PMEs que ainda operam com Excel, WhatsApp, lousa ou papel. A primeira versao vendavel deve resolver escala mensal com templates, feriados, contadores, alertas e publicacao auditavel. Recursos como ponto completo, banco de horas avancado, dimensionamento e IA entram por fases, para evitar competir cedo demais com suites maduras de ponto/RH.

## Mapa por fases

| Fase | Horizonte | Foco | Entregaveis principais |
|---|---:|---|---|
| 0 | Imediato | Auditoria e alinhamento | Build/lint/testes, gaps por modulo, riscos de seguranca, matriz de reaproveitamento |
| 1 | Mes 1 | Fundacao comercial e trial | Leads com UTM/referrer, consentimentos, segmento, faixa de colaboradores, Google SSO/trial |
| 2 | Mes 2 | Escala mensal PME | Calendario mensal, feriados, templates 5x2/6x1/12x36, contadores, grid mensal |
| 3 | Mes 3 | Conformidade e publicacao | Policies backend, alertas, rascunho -> validacao -> publicacao, versionamento e audit log |
| 4 | Mes 4 | Trocas, ausencias e notificacoes | Troca com aceite do colega e gestor, ausencias, ferias, atestados, notificacoes |
| 5 | Mes 5 | Banco de horas e ponto web | Check-in/out/intervalo, saldos, relatorios, preparacao LGPD para geolocalizacao |
| 6 | Mes 6 | Dimensionamento e IA MVP | Demanda x cobertura, alertas de sub/superdimensionamento, IA explicavel para conflito/substituto |

## Fase 0 — Auditoria, estabilizacao e documentacao

- Validar estado Git antes de qualquer mudanca funcional.
- Executar ou documentar pendencias de `mvn test`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `strapi build` e `docker compose config`.
- Atualizar mapa de rotas frontend/BFF/backend/OpenAPI.
- Confirmar que `OpenApiController` manual cobre endpoints reais apos qualquer mudanca REST.
- Revisar dados sensiveis em sessao, logs e DTOs.
- Separar claramente backlog de produto pronto, parcial e planejado.

## Fase 1 — Fundacao comercial, lead e trial

- Evoluir formulario comercial para capturar nome, email corporativo, telefone, empresa, faixa de colaboradores, segmento, UTM/referrer, consentimentos e landing/campanha.
- Usar validacao compartilhavel no frontend com Zod e validacao obrigatoria no backend.
- Marcar email pessoal quando usado em campo corporativo.
- Normalizar telefone e preparar formato E.164.
- Criar ou evoluir entidades como `MarketingLead`, `CampaignAttribution`, consentimento LGPD e recomendacao inicial de plano/template.
- Integrar Strapi como fonte editorial de landing pages, formularios e campanhas, mantendo a persistencia operacional no Spring Boot.
- Preparar trial self-service de 14 dias e trial qualificado de 30 dias.

## Fase 2 — Escala mensal para empresas pequenas

- Gerar calendario mensal por mes, ano, timezone e unidade.
- Criar CRUD de feriados nacionais, estaduais, municipais e customizados por tenant/unidade.
- Suportar templates 5x2, 6x1, 12x36 e base extensivel para 4x2, 6x2 e personalizado.
- Calcular contadores mensais por colaborador: dias trabalhados, ausentes, descansos, ferias, faltas, feriados trabalhados, fins de semana trabalhados e horas previstas.
- Implementar legendas configuraveis com impacto em dias, horas, banco de horas, folha e alertas.
- Entregar UI de grid mensal em desktop e mobile.

## Fase 3 — Conformidade, publicacao e auditoria

- Consolidar policies trabalhistas no backend.
- Classificar alertas em criticos e nao criticos.
- Implementar fluxo rascunho -> validacao -> publicacao -> retificacao -> arquivamento.
- Exigir ciencia dos alertas criticos antes de publicar.
- Versionar publicacoes de escala.
- Registrar audit log com ator, entidade, antes/depois, motivo, timestamp, tenant e correlacao de request.
- Criar relatorios mensais basicos para gestor/RH.

## Fase 4 — Trocas, ausencias e notificacoes

- Evoluir maquina de estados de troca: `SOLICITADO`, `EM_ANALISE`, `APROVADO_PELO_COLEGA`, `APROVADO_PELO_GESTOR`, `EFETIVADO`, `REJEITADO` e `CANCELADO`.
- Validar compatibilidade de cargo, setor, unidade, habilidade, descanso e carga horaria.
- Adicionar ferias, atestados, faltas e bloqueios de disponibilidade.
- Criar notificacoes in-app e email para solicitante, colega e gestor.
- Entregar mural simples da escala publicada para colaborador.

## Fase 5 — Banco de horas e ponto web

- Evoluir `TimeRecord` para suportar entrada, saida, inicio/fim de intervalo, origem, timezone e comprovante.
- Criar relatorio de presenca por colaborador, dia e periodo.
- Controlar saldo de banco de horas positivo, negativo, compensado e expirado.
- Parametrizar acordo individual, acordo coletivo, validade e classificacao entre banco de horas e hora extra.
- Preparar geolocalizacao com consentimento explicito, minimizacao, finalidade e retencao.
- Evitar promessa de REP-P/Portaria 671 ate validacao juridica e tecnica especifica.

## Fase 6 — Dimensionamento e IA MVP

- Modelar demanda por setor, unidade, dia e turno.
- Comparar necessario x escalado x disponivel.
- Gerar alertas de subdimensionamento e superdimensionamento.
- Criar IA explicavel para conflito, substituicao e risco de escala.
- Controlar uso de IA por plano, credito e tenant.
- Garantir que IA sugira e explique, mas que validacao e efetivacao continuem no backend.

## Trilhas transversais

- **Arquitetura:** migrar gradualmente para monolito modular com limites por dominio, sem quebrar endpoints existentes.
- **Seguranca:** reforcar multi-tenant, RBAC/ReBAC, minimizacao de dados e protecao de uploads.
- **DevOps:** health checks, Compose por ambiente, secrets obrigatorios fora de dev, backups e CI/CD.
- **Documentacao:** manter `docs/` como fonte conceitual e atualizar OpenAPI manual ao mudar REST.
- **Qualidade:** ampliar testes unitarios de dominio e testes de integracao de autenticacao, JPA, JWT e endpoints.

## Nichos prioritarios

### Entrada PLG

- Igrejas e organizacoes com voluntarios/colaboradores fixos.
- Restaurantes e pequenos varejos.
- Pequenas clinicas.
- Empresas de tecnologia com escala hibrida/suporte.
- Facilities/limpeza com poucos postos.

### Venda consultiva

- Seguranca patrimonial.
- Clinicas e hospitais medios.
- Transportadoras e centros de distribuicao.
- Call centers.
- Operacoes 24/7.
