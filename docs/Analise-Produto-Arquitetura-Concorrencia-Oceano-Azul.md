# Analise da aplicacao, concorrencia e estrategia de Oceano Azul

Data da analise: 2026-06-06.

## 1. Resumo executivo

A aplicacao ja tem uma base full-stack relevante para um SaaS B2B de gestao de escalas: frontend principal em Next.js 16, backend oficial em Spring Boot/Java 21, PostgreSQL em Docker, Strapi para conteudo editorial, NextAuth autenticando contra o Spring Boot, rotas publicas/privadas, dashboard, calendario visual, empresas, colaboradores, setores, projetos, escalas, trocas, auditoria inicial, geofencing inicial e landing page com conteudo gerenciado pelo Strapi.

Mesmo assim, o produto ainda nao atende plenamente a proposta descrita no documento competitivo. Hoje ele esta mais proximo de um MVP tecnico de autenticacao, cadastro organizacional, calendario de escalas e fluxo basico de troca do que de uma plataforma madura de "gestao inteligente de escalas operacionais, ponto, posto, banco de horas, compliance e IA".

Diagnostico direto:

- Atende parcialmente: arquitetura alvo, SaaS multiempresa inicial, login contra Spring Boot, calendario visual, escala mensal, modalidade presencial/remota, troca de escala, geofencing basico, Strapi para marketing, Docker Compose com rede comum e bancos separados para Strapi/backend.
- Nao atende ainda: ponto offline, persistencia real de marcacoes de ponto, Portaria 671/REP-P, banco de horas calculado, posto de trabalho, modalidade hibrida, IA operacional, app mobile/PWA offline, compliance trabalhista configuravel por empresa/convencao, LGPD completa, relatorios reais de folha, integracoes com folha/ERP/relogio, governanca de dados sensiveis e RBAC consistente para OWNER/MANAGER.
- Maior risco atual: parecer no marketing mais completo do que o produto realmente entrega. A landing ja fala em banco de horas e IA assistiva, mas o codigo ainda trata esses pontos como planejamento ou mock.

Conclusao: o melhor caminho e assumir o posicionamento de Oceano Azul, mas reduzir o MVP vendavel para "escala operacional + troca + geofencing + calendario + alertas trabalhistas basicos", antes de prometer controle de ponto completo, banco de horas e IA em producao.

## 2. Fontes e escopo da analise

Escopo local analisado:

- Frontend oficial: `Frontend/web-app3/escala`.
- Backend oficial: `Backend/java-app1/demo`.
- CMS: `Backend/cms-strapi`.
- Docker/PostgreSQL: `docker-compose.yml`, `Data/postgres`.
- Documentacao: `docs/` e `Frontend/web-app3/escala/docs`.

Fontes externas consultadas para validar o contexto competitivo atual:

- VR Pontomais: https://www.vr.com.br/controle-de-ponto
- PontoTel: https://www.pontotel.com.br/lp/registro-de-ponto-home-office
- Escala.app: https://escala.app/produtos/
- TOTVS/Ahgora: https://www.totvs.com/ahgora
- UKG Contract Services: https://www.ukg.com/industry-solutions/field-contract-services/contract-services
- UKG Healthcare: https://www.ukg.com/industry-solutions/healthcare

Observacao: esta analise nao executou uma auditoria legal de Portaria 671, LGPD ou CLT. Os pontos legais abaixo devem ser tratados como orientacao tecnica/produto e precisam de validacao juridica/DP antes de venda.

## 3. Estado atual da estrutura do projeto

### 3.1 Estrutura geral

O repositorio esta organizado em quatro frentes principais:

- `Frontend/web-app3/escala`: frontend principal e BFF Next.js.
- `Backend/java-app1/demo`: backend Spring Boot oficial.
- `Backend/cms-strapi`: CMS Strapi.
- `Data/postgres`: imagem/init do PostgreSQL.

Tambem existem frentes legadas ou nao oficiais:

- `Frontend/web-app1/app`: deve ser preservado para frontend futuro, mas nao deve guiar a implementacao atual.
- `Backend/cms-strapi` ainda contem alguns tipos de conteudo que parecem de regra/aplicacao, embora a diretriz oficial restrinja o Strapi a CMS.
- `Data/postgres/init.sql` ainda cria tambem `intranet_api` para uma API .NET, que nao faz parte da arquitetura oficial atual descrita no AGENTS.md.

### 3.2 Frontend

Pontos fortes:

- Usa Next.js 16, React 19, TypeScript, Tailwind, Radix/shadcn-like components, NextAuth, next-intl, next-themes, Zod e Zustand.
- Tem rotas publicas e privadas com App Router.
- Tem BFF em `src/app/api/bff/...`, mascarando URLs internas do Spring Boot.
- Tem landing page publica alimentada pelo Strapi, com modulos, setores, planos, FAQ e artigos.
- Tem dashboard privado, calendario visual, escalas por mes/semana/ano, detalhes por dia, tabela de usuarios escalaveis, troca de escala e relatorios.
- Tem abstracao de mapa com Leaflet.
- Tem i18n com mensagens `pt-BR`, `en` e `es`.

Lacunas:

- A organizacao ainda mistura `components`, `services`, `interfaces`, `core`, `features` e `infrastructure`. Ja ha tentativa de feature slicing, mas a fronteira ainda nao esta uniforme.
- O BFF tem rota para varias areas, mas falta `/api/bff/check-in`, embora o componente `CheckInButton` chame essa URL.
- A permissao central de escala no frontend permite gestao apenas para `ADMIN`, enquanto outras telas mencionam `OWNER` e `MANAGER`.
- A UI privada ainda tem alguns dados mockados, por exemplo projetos ativos no dashboard.
- A landing melhorou o posicionamento, mas ainda ha componentes antigos com fallback generico de portal/conteudo.
- O calendario visual e bom para MVP, mas ainda nao oferece a visao operacional por posto, cobertura minima, buracos de escala, custo previsto ou sugestao de substituto.

### 3.3 Backend Spring Boot

Pontos fortes:

- Java 21 LTS e Spring Boot.
- Autenticacao com BCrypt, JWT, roles e NextAuth integrado no frontend.
- Entidades para `Company`, `User`, `Role`, `Employee`, `Sector`, `Project`, `WorkShift`, `ShiftSwapRequest`, `Absence`, `AuditLog`.
- Multiempresa inicial por `company`.
- Escalas com restricao unica por funcionario/data em `WorkShift`.
- Modalidade de trabalho `PRESENCIAL` e `REMOTO`.
- Geofencing inicial no `CheckInService`, usando Haversine no servidor.
- Dominio puro inicial em `scheduling/domain`, com `LaborRuleEngine`, `SolicitacaoTrocaEscala`, `FluxoTrocaEscala` e testes unitarios.
- Regras trabalhistas iniciais para jornada diaria, semanal, mensal, intrajornada, interjornada, descanso semanal, 5x2, 6x1 e 12x36.
- Auditoria inicial registra ator, acao, entidade, id e detalhes.

Lacunas:

- O backend ainda e majoritariamente arquitetura em camadas (`controller`, `service`, `entity`, `repository`), nao hexagonal completa.
- Services concentram regra, transacao, consulta e persistencia.
- Controllers ainda retornam entidades JPA em alguns endpoints, como `ScheduleController`.
- O geofencing valida, mas nao persiste o ponto. Ha comentario no codigo dizendo que ali "salvaria" em tabela de ponto.
- Nao ha entidade propria de registro de ponto, espelho, comprovante, ajustes, fechamento, banco de horas ou assinatura.
- O relatorio de folha usa valores mockados (`160h`, `10h extras`, `5h noturnas`, custo fixo).
- O fluxo de troca tem dominio com estados completos, mas a persistencia colapsa `SOLICITADO`/`EM_ANALISE` em `PENDING`.
- A aprovacao por colega nao valida se o usuario autenticado e realmente o colega envolvido.
- O gestor e auditado como string fixa `"manager"` em parte do fluxo, nao necessariamente o usuario real.
- RBAC no Spring exige `ADMIN` em `EscalaController`; `OWNER` e `MANAGER` nao tem a permissao operacional esperada.
- Nao ha Flyway/Liquibase; `ddl-auto:update` em desenvolvimento e `validate` em homolog/producao.
- Nao ha eventos de dominio reais para notificacao/auditoria; auditoria e chamada direta.

### 3.4 Strapi

Pontos fortes:

- Possui single types e collection types para landing, global, menu, footer, artigos, categorias, autores, banner, FAQ, modulos, setores/industrias e planos.
- O bootstrap restringe permissoes publicas a leitura de conteudo editorial selecionado.
- A landing ja suporta trial de 3 meses, trial/limite de IA, security statement, planos e setores.
- E adequado para criar landing pages segmentadas por nicho.

Lacunas:

- O Strapi ainda tem content types de aplicacao, como `company`, `shift`, `shift-swap`, `work-schedule`, `user-account`, `user-role`, `audit-log`, `compensation-history`, `learning-progress`. Isso contradiz a decisao oficial de restringi-lo a CMS.
- Upload via BFF para Strapi (`/api/bff/upload`) nao exige autenticacao no proprio BFF.
- Conteudo comercial por segmento ainda parece generico; faltam landing pages especificas para saude, seguranca, terceirizacao, logistica e tecnologia.
- Nao ha estrutura clara de politica de privacidade, termos, LGPD, cookies e consentimento editorial.

### 3.5 Docker e DevOps

Pontos fortes:

- `docker-compose.yml` orquestra Postgres, backend, Strapi e frontend em rede comum.
- Postgres cria bancos/usuarios separados para Strapi e backend.
- Backend e frontend tem Dockerfiles com build multi-stage.
- Java 21 no backend.
- Next usa target dev no compose e volumes para desenvolvimento.

Lacunas:

- Credenciais padrao e JWT secret aparecem em configs de desenvolvimento. Aceitavel para dev local, mas perigoso se reaproveitado.
- `Data/postgres/init.sql` cria um banco .NET (`intranet_api`) fora da arquitetura oficial atual.
- Backend Dockerfile usa `-DskipTests`, enfraquecendo a garantia de build.
- Nao ha healthchecks no compose.
- Nao ha Compose separado para homolog/producao.
- Nao ha volumes/backups documentados para Strapi uploads e Postgres alem do volume local.
- Nao ha pipeline CI/CD no nivel raiz evidente para backend/frontend/Strapi.

## 4. Aderencia aos pontos do documento competitivo

| Ponto do documento | Estado atual | Evidencia/observacao | Prioridade |
|---|---:|---|---:|
| Empresas com escalas 5x2 | Parcial | `LaborRuleEngine` tem regra 5x2, mas geracao principal usa `PadraoEscala.COMUM` | Alta |
| Empresas com escalas 6x1 | Parcial | regra existe no dominio, mas nao esta configuravel no fluxo principal | Alta |
| Empresas com escala 12x36 | Parcial | regra existe, mas falta UI/configuracao por empresa/contrato | Alta |
| Banco de horas | Baixo | marketing cita, relatorio e mock, sem entidade/calculo | Critica |
| Geolocalizacao | Parcial | empresa tem lat/lng/raio e check-in valida Haversine | Alta |
| Ponto offline | Nao atende | sem PWA/service worker/fila offline/sync | Critica |
| Registro real de ponto | Baixo | UI chama rota inexistente; backend nao persiste batida | Critica |
| Posto de trabalho | Nao atende | nao ha entidade de posto/unidade/cliente/contrato/cobertura | Critica |
| Solicitacao de troca de escala | Parcial | existe criacao/aprovacao, mas fluxo e autorizacao incompletos | Alta |
| Calendario visual | Atende parcialmente | calendario mensal/semanal/anual, detalhes e badges | Alta |
| Modalidade presencial/remota | Parcial | `WorkMode` tem `PRESENCIAL`/`REMOTO` | Media |
| Modalidade hibrida | Nao atende | enum nao tem `HIBRIDO`; talvez seja combinacao de dias | Media |
| IA para gestores | Nao atende | Strapi/landing citam IA, sem modulo de IA no codigo | Alta |
| Alertas de buraco na escala | Nao atende | dashboard tem KPIs basicos, sem motor de cobertura | Alta |
| Sugestao automatica de substituto | Nao atende | inexistente | Alta |
| Compliance CLT/LGPD | Parcial | regras iniciais e BCrypt/JWT; falta governanca completa | Critica |
| Relatorios de folha | Baixo | CSV existe, mas valores mockados | Alta |
| Conteudo dinamico via Strapi | Parcial/alto | landing, menu, footer, artigos e planos existem | Media |

## 5. Analise de UI/UX

### Pontos positivos

- A landing atual ja comunica "Gestao Inteligente de Escalas" e inclui modulos, setores, planos, FAQ e conteudo.
- O calendario visual e uma boa base para a proposta de valor, com badges, tooltip, feriados e detalhes por dia.
- A UI usa componentes consistentes, icones, dark/light theme e elementos acessiveis de Radix.
- A presenca digital com mapa e geofence e uma experiencia forte para demonstracao, quando a integracao for corrigida.
- As rotas privadas mostram separacao entre dashboard, escala, trocas, relatorios, empresas, setores, projetos, colaboradores e auditoria.

### Problemas de UX/produto

- O produto ainda parece dividido entre "portal/conteudo" e "plataforma operacional"; remover rastros de nomenclatura legada e padronizar a narrativa e essencial.
- O dashboard principal nao mostra ainda o que o gestor operacional mais precisa: postos descobertos, risco de hora extra, conflitos, ausencias, trocas pendentes, cobertura minima e proxima acao recomendada.
- A experiencia de colaborador ainda precisa ser mais simples: "minha escala", "bater ponto", "solicitar troca", "meu banco de horas" e "meus comprovantes".
- Para empresas com operacao critica, a visao por posto/unidade/cliente e mais importante que apenas por funcionario.
- Falta mobile-first real para registro de ponto e solicitacao de troca.

## 6. Dados dos usuarios, seguranca e LGPD

### O que esta bom

- Senhas com BCrypt.
- JWT no Spring Boot e NextAuth no frontend.
- Autenticacao centralizada no backend Spring.
- ReCAPTCHA pode ser exigido em producao.
- Usuarios possuem `company`, viabilizando multi-tenancy.
- Strapi public role e restringido a leitura de conteudo editorial selecionado.
- Auditoria inicial existe.

### Riscos e lacunas

- Isolamento multi-tenant ainda precisa ser reforcado em todos os repositories/services. Varias listagens parecem filtrar pouco por empresa.
- RBAC inconsistente: OWNER/MANAGER aparecem nas regras de negocio e UI, mas a gestao de escala exige ADMIN.
- Dados sensiveis no token/session: endereco, CEP, bairro, cidade, cargo e funcao sao carregados na sessao do NextAuth. Avaliar minimizacao.
- Uploads para Strapi via BFF precisam de autenticacao, limite de tamanho, validacao de MIME, antivirus/scan quando necessario e politica de retencao.
- Ponto com geolocalizacao exige base legal, transparencia, finalidade, minimizacao, retencao e visualizacao pelo titular.
- Falta trilha de consentimento/politica para geolocalizacao, reconhecimento facial futuro e IA.
- Falta soft delete em entidades relevantes.
- Falta registro de antes/depois em auditoria.
- Falta protecao antifraude para ponto: IP, device fingerprint persistido, comprovante, assinatura, tentativas recusadas, timezone e origem.
- Falta controle para Swagger em producao.
- Secrets padrao estao em arquivos/configs de dev; producao precisa de secrets manager/variaveis obrigatorias.

## 7. Analise de marketing e concorrencia

### Leitura competitiva atual

Os concorrentes fortes de ponto (VR Pontomais, PontoTel, Sólides/Tangerino, Ahgora/TOTVS) competem com escala, jornada, banco de horas, ponto digital, geolocalizacao, reconhecimento facial, conformidade e relatorios. Eles tem vantagem em maturidade, marca, compliance e integracoes.

Os concorrentes focados em escala/WFM (Escala.app, Integra Escala, Agendoctor, DoctorID, Pega Plantao, UKG) competem mais diretamente na dor de escala, plantao, cobertura, pagamentos e operacao. Eles tem vantagem em profundidade de caso de uso, principalmente saude e enterprise.

As fontes externas confirmam que:

- VR Pontomais comunica Portaria 671, LGPD, antifraude, geolocalizacao, presencial/hibrido/remoto e integracao com folha.
- PontoTel comunica reconhecimento facial, geolocalizacao, IP e funcionamento para ponto remoto/home office.
- Escala.app comunica WFM 100% online, jornadas CLT, plantões, distribuicao de descansos, conflito de escala e regras trabalhistas.
- TOTVS/Ahgora comunica dados em tempo real, dashboards, reconhecimento facial, localizacao georreferenciada, escalas, intrajornada/interjornada e multiplas unidades.
- UKG comunica WFM enterprise, scheduling, compliance, setores como saude e servicos por contrato.

### Estado atual do marketing do produto

Pontos fortes:

- A categoria "Gestao Inteligente de Escalas" ja aparece na landing.
- O Strapi permite atualizar conteudo sem deploy.
- Existem campos para planos, setores, FAQ, features e trial de IA.
- A frase de valor esta se aproximando de "operacao, regras e auditoria".

Lacunas:

- Falta foco vertical. A landing ainda nao vende claramente para hospitais, clinicas, seguranca e terceirizacao.
- Falta prova de valor: calculadora de custo de hora extra, demonstracao interativa, comparativo planilha/WhatsApp, indicadores e prints reais.
- Falta pagina de seguranca/LGPD/compliance.
- Falta explicar limites: IA em beta/credito, ponto em desenvolvimento, banco de horas basico etc.
- Falta CTA consultivo por segmento: "Agendar demo para seguranca", "Ver escala 12x36", "Simular cobertura de posto".

## 8. SWOT do estado atual da aplicacao

### Forcas

| Forca | Impacto |
|---|---|
| Stack moderna e alinhada ao alvo | Next.js 16, Spring Boot, Java 21, PostgreSQL, Docker e Strapi sao boa base para SaaS B2B |
| BFF Next.js ja existe | Mascara o backend e permite agregacao futura |
| Login contra Spring Boot | Evita depender do Strapi para usuarios finais |
| Dominio trabalhista inicial | Regras 5x2, 6x1, 12x36 e intervalos ja tem base testada |
| Calendario visual funcional | Boa base de UX para colaborador e gestor |
| Strapi pronto para marketing | Permite evoluir landing, planos, FAQ, artigos e segmentos sem deploy |
| Geofencing inicial | Diferencial importante para terceirizacao, seguranca e equipes presenciais |
| Auditoria inicial | Comeco para rastreabilidade e compliance |
| Docker Compose integrado | Facilita desenvolvimento full-stack |

### Fraquezas

| Fraqueza | Risco |
|---|---|
| Produto promete mais do que implementa | Risco comercial e de confianca em demo/venda |
| Ponto nao persiste | Nao concorre ainda com Pontomais/PontoTel/TOTVS |
| Banco de horas e relatorio sao incompletos | Nao atende DP/RH de forma vendavel |
| RBAC inconsistente | OWNER/MANAGER nao operam como esperado |
| Multi-tenancy incompleto | Risco de vazamento entre empresas |
| Strapi contem tipos de regra/aplicacao | Confunde arquitetura e responsabilidade de dados |
| Falta posto de trabalho | Reduz diferencial para seguranca/terceirizacao |
| Falta IA real | Diferencial estrategico ainda e apenas promessa |
| Falta app/PWA offline | Nao atende ponto offline nem operacao de campo |
| Arquitetura backend ainda nao e hexagonal | Dificulta escalar dominios e testes |

### Oportunidades

| Oportunidade | Como aproveitar |
|---|---|
| Empresas ainda usam WhatsApp e planilha | Criar demo "do caos para escala coberta" |
| Nichos com operacao critica | Priorizar saude, seguranca e terceirizacao |
| Geolocalizacao por posto | Criar modulo de evidencias para cliente final |
| IA pouco madura em escala operacional no Brasil | Comecar com recomendacoes auditaveis e explicaveis |
| Strapi para landing por segmento | Criar paginas de saude, seguranca, terceirizacao, logistica |
| Compliance como venda consultiva | Vender reducao de risco e previsibilidade |
| PMEs querem implantacao simples | Onboarding guiado, templates 5x2/6x1/12x36 e trial |

### Ameacas

| Ameaca | Mitigacao |
|---|---|
| Players grandes copiarem IA/alertas | Foco em nicho e velocidade de UX |
| Concorrentes de ponto ja maduros | Nao competir como "mais um ponto"; vender cobertura operacional |
| Legislação e convencoes coletivas | Motor de regras configuravel e validacao juridica |
| Risco LGPD por geolocalizacao/biometria | Privacy by design, minimizacao e transparencia |
| Resistência de colaboradores | Portal do colaborador com comprovantes, justificativas e transparencia |
| Complexidade de segmentos demais | Escolher 1 ou 2 verticais para MVP comercial |

## 9. 4Ps do estado atual

### Produto

Estado atual:

- Plataforma web com cadastro de empresas, usuarios, colaboradores, setores, projetos, calendario de escalas, troca de escala, autenticacao, conteudo via Strapi, geofencing inicial e relatorios iniciais.

Maturidade:

- Bom MVP tecnico.
- Ainda nao e produto competitivo completo contra ponto digital maduro.
- Ainda nao e plataforma operacional completa contra WFM/escala vertical.

Recomendacao:

- Produto MVP vendavel deve focar em: escalas 5x2/6x1/12x36 configuraveis, calendario gestor/colaborador, troca de escala, geofencing persistido, relatorio basico real, alertas de conflito e landing vertical.

### Preco

Estado atual:

- Strapi ja suporta conteudo de planos e trial de 3 meses.
- Nao ha implementacao de billing, limites, assinatura, trial enforcement, creditos de IA ou metrica de colaborador ativo.

Recomendacao:

- Tratar "3 meses gratis" como campanha comercial, nao como regra fixa sem controle.
- Implementar `Plan`, `Subscription`, `Trial`, `FeatureFlag` e `UsageLimit`.
- Cobrar por colaborador ativo/mes e modulos: ponto, posto/geolocalizacao, banco de horas, IA.

### Praca

Estado atual:

- Canal digital via site/landing.
- Sem funil claro para demo comercial por segmento.
- Sem integracoes ou marketplace.

Recomendacao:

- Criar landing pages segmentadas no Strapi.
- Priorizar venda consultiva para clinicas, seguranca e terceirizacao.
- Criar CTA WhatsApp comercial e agendamento.
- Documentar API/integracoes futuras com folha.

### Promocao

Estado atual:

- Conteudo e artigos existem, mas ainda genericos.
- Mensagem de produto boa, mas precisa atacar dores concretas.

Recomendacao:

- Promover mensagens como:
  - "Chega de escala no WhatsApp."
  - "Veja postos descobertos antes do turno comecar."
  - "Controle escala, presenca e troca em um unico calendario."
  - "Geolocalizacao e evidencias para equipes em campo."
  - "IA sugere; gestor decide."
- Criar conteudos:
  - Guia de escala 12x36.
  - Checklist de jornada 5x2/6x1.
  - Calculadora de hora extra.
  - Comparativo planilha vs calendario operacional.
  - Landing para terceirizadas com prova de presenca no posto.

## 10. Estrategia de Oceano Azul

### Categoria recomendada

Gestao Inteligente de Escalas Operacionais.

### Frase de venda recomendada

"Gestao inteligente de escalas para empresas que nao podem parar."

### Tese estrategica

Nao competir como "sistema de ponto". Esse mercado ja tem players maduros, marca forte, integracao com folha e discurso legal. Competir como plataforma operacional que evita buraco de escala, falta no posto e decisao tardia.

### Matriz ERRC adaptada ao estado atual

| Acao | Estrategia |
|---|---|
| Eliminar | Dependencia de planilhas, WhatsApp, ligacoes de ultima hora, validacao manual de conflito e aprovacao informal de troca |
| Reduzir | Tempo de montagem de escala, retrabalho de DP, hora extra surpresa, falta sem substituto e ambiguidade entre gestor/colaborador |
| Elevar | Calendario visual, rastreabilidade, geofencing, transparencia para colaborador, alertas preventivos e configuracao por setor/projeto |
| Criar | Posto de trabalho, score de risco da escala, assistente de substituicao, simulador de custo, cobertura minima e IA explicavel |

### Diferenciais que devem virar produto

1. Cobertura de posto em tempo real.
2. Alertas de risco antes do turno.
3. Sugestao automatica de substituto com criterios transparentes.
4. Templates 5x2, 6x1, 12x36 e personalizados.
5. Geofencing com evidencias e LGPD by design.
6. Banco de horas basico e fechamento simples.
7. IA assistiva com limites, justificativa e decisao humana.
8. Landing e onboarding por segmento.

## 11. Roadmap recomendado

### Fase 1 - Corrigir MVP operacional

Prioridade critica:

- Criar rota BFF `/api/bff/check-in`.
- Criar entidade `TimePunch`/`PointRecord` no Spring.
- Persistir ponto com data/hora servidor, lat/lng, distancia, IP, device fingerprint, status aceito/recusado e usuario.
- Corrigir RBAC para OWNER/MANAGER/ADMIN no frontend e backend.
- Garantir filtro por `company_id` em listagens e mutacoes.
- Transformar relatorio de folha de mock para calculo real basico com base em escalas/pontos.
- Remover ou isolar content types de aplicacao no Strapi.

### Fase 2 - Escala vendavel

Prioridade alta:

- Implementar configuracao de padrao de escala por empresa/setor/colaborador: 5x2, 6x1, 12x36, personalizada.
- Conectar `PadraoEscala` ao fluxo real de criacao/geracao.
- Criar configuracao de capacidade por empresa, setor, projeto e posto.
- Criar entidade `Workplace/PostoTrabalho`.
- Criar alertas de conflito, descanso, lotacao, indisponibilidade e cobertura minima.
- Melhorar troca de escala com aceite real do colega e aprovacao do gestor autenticado.
- Criar soft delete para entidades principais.

### Fase 3 - Ponto, banco e compliance

Prioridade alta:

- Ponto offline via PWA: fila local, assinatura/idempotencia, sincronizacao e conflito.
- Espelho de ponto e comprovantes.
- Banco de horas basico por colaborador/periodo.
- Ajuste de ponto com justificativa e aprovacao.
- Regras de adicional noturno, hora extra, DSR e feriados.
- Politicas LGPD: consentimento/transparencia, retencao, exportacao e exclusao quando aplicavel.

### Fase 4 - Oceano Azul/IA

Prioridade estrategica:

- Assistente de escala em beta com limite de creditos.
- Sugestao de substituto com ranking por disponibilidade, descanso, custo, setor/projeto/posto e historico.
- Score de risco da escala.
- Simulador de custo de escala/hora extra.
- Resumo operacional diario para gestor.
- Explicabilidade: toda recomendacao deve mostrar motivos e regras consideradas.

### Fase 5 - Comercializacao e escala

Prioridade media/alta:

- Landing pages por segmento no Strapi.
- Funil de demo, WhatsApp comercial e CRM.
- Billing/trial/planos.
- Integracoes com folha/ERP.
- Observabilidade, CI/CD, backups e ambientes homolog/producao.

## 12. Recomendacao final

A aplicacao tem uma fundacao melhor do que um prototipo simples: ja existe backend oficial, frontend principal, CMS, Docker, autenticacao, calendario e regras de dominio iniciais. O ponto decisivo agora e escolher foco.

Recomendacao pratica:

1. Nao vender ainda como controle de ponto completo ou banco de horas completo.
2. Vender o MVP como "calendario inteligente de escalas e trocas com validacao de jornada e geolocalizacao em evolucao".
3. Priorizar um nicho inicial: seguranca/terceirizacao ou clinicas/hospitais pequenos.
4. Implementar posto de trabalho e ponto persistido antes de IA.
5. Usar IA primeiro como assistente limitado para sugestao de substituto, nao como motor autonomo.
6. Manter Strapi apenas como CMS e mover qualquer dado operacional para Spring/PostgreSQL.

Se a execucao seguir esse caminho, o produto pode fugir da briga direta de "mais um ponto eletronico" e ocupar uma posicao mais defensavel: uma plataforma que ajuda empresas a manter turnos, equipes e postos cobertos antes que o problema vire falta, multa, hora extra ou cliente insatisfeito.
