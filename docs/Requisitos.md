# Requisitos do Sistema

Data: 2026-06-30

Este documento foi alinhado ao estado real do projeto e diferencia o que ja existe do que ainda e backlog.

## Requisitos funcionais

| ID | Requisito | Prioridade | Estado |
|---|---|---:|---|
| RF01 | Registrar empresas/tenants e criar administracao inicial | Alta | Implementado |
| RF02 | Convidar colaboradores e atribuir papeis | Alta | Implementado |
| RF03 | Gerir usuarios, perfil, senha e tema | Alta | Implementado |
| RF04 | Gerir funcionarios, setores, projetos e postos | Alta | Implementado |
| RF05 | Gerar e consultar escalas classicas e trocas | Alta | Implementado |
| RF06 | Exibir dashboard com KPIs, trocas e resumo operacional | Alta | Implementado |
| RF07 | Gerir capacidades operacionais por setor/posto | Alta | Implementado |
| RF08 | Expor administracao ReBAC para `OWNER`/`ADMIN` | Alta | Implementado |
| RF09 | Capturar leads publicos com UTM/referrer | Alta | Implementado |
| RF10 | Entregar billing com checkout, assinatura e cancelamento | Alta | Implementado |
| RF11 | Oferecer mensageria in-app com leitura e decisao | Alta | Parcial |
| RF12 | Entregar Escala Inteligente com calendario mensal, feriados, legendas e ciclo | Alta | Implementado |
| RF13 | Editar atribuicoes mensais em grade e salvar em bulk | Alta | Implementado |
| RF14 | Acelerar a edicao mensal com preencher semana, copiar mes, presets e dif | Media | Implementado |
| RF15 | Central de mensagens completa com inbox, enviados e composer | Media | Planejado |
| RF16 | Buscar/listar ciclos mensais por mes/unidade sem depender de `cycleId` na URL | Media | Planejado |
| RF17 | Ponto web com geolocalizacao e geofencing | Media | Parcial |
| RF18 | Integracoes WhatsApp/Telegram para pedidos operacionais | Media | Planejado |
| RF19 | Banco de horas basico com saldo, compensacao e expiracao | Media | Planejado |
| RF20 | IA operacional explicavel para substituicao/conflito | Media | Parcial |

## Requisitos nao funcionais

| ID | Categoria | Descricao |
|---|---|---|
| RNF01 | Arquitetura | Frontend com SSR + BFF; backend como fonte da verdade |
| RNF02 | Seguranca | Senhas com BCrypt; sessao minimizada; tokens protegidos |
| RNF03 | Multi-tenant | Isolamento por empresa/tenant em backend e BFF |
| RNF04 | Disponibilidade | Compose local com healthchecks; cloud com readiness/liveness |
| RNF05 | Performance | Dashboard e paginas SSR devem degradar graciosamente quando backend ainda estiver subindo |
| RNF06 | Auditoria | Alteracoes criticas devem gerar trilha de auditoria |
| RNF07 | UX | UI responsiva para dashboard e fluxos operacionais |
| RNF08 | Internacionalizacao | Suporte atual via `next-intl` |
| RNF09 | Concorrencia | Integridade de edicao de escala protegida por backend e regras transacionais |
| RNF10 | Documentacao | Mudanca REST exige atualizacao do `OpenApiController` e dos docs canonicamente relacionados |

## Observacoes de estado atual

- A central de notificacoes no header existe
- O modal de mensagens por tipo existe para `PERMISSION_REQUEST` e `SHIFT_SWAP`
- Ainda nao existe pagina dedicada de inbox/outbox
- A Escala Inteligente ja existe como produto navegavel
- O backend de scheduling ja oferece o fluxo principal do ciclo mensal
