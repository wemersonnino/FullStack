# Analise de produto, arquitetura, mercado e Oceano Azul

Data da analise: 2026-06-25.

## 1. Resumo executivo

O projeto ja tem uma base relevante para um SaaS B2B de gestao inteligente de escalas: frontend principal em Next.js 16, BFF em Route Handlers, backend oficial em Spring Boot 4.1.0/Java 25, PostgreSQL em Docker, Strapi como CMS, autenticacao via backend, rotas publicas/privadas, dashboard, calendario de escala, funcionarios, setores, projetos, trocas, auditoria, ReBAC, ponto web basico, leads com UTM/referrer, billing, capacidade operacional e IA mock.

A oportunidade de mercado continua clara: unir escala mensal simples para PMEs, validacao trabalhista backend-first, banco de horas/ponto como extensao natural e aquisicao PLG/comercial com trial, Google SSO, campanhas rastreaveis e conteudo segmentado no Strapi.

O melhor posicionamento inicial nao e tentar vencer suites maduras de ponto/RH em todos os modulos. A entrada recomendada e:

> A forma mais simples de sair da planilha e montar uma escala mensal correta, com feriados, contadores, alertas e publicacao segura, sem expor token, sem regra critica no frontend e com base pronta para crescer para ponto, banco de horas e IA.

## 2. Escopo local analisado

- Frontend oficial: `Frontend/web-app3/escala`.
- Backend oficial: `Backend/java-app1/demo`.
- CMS: `Backend/cms-strapi`.
- Docker/PostgreSQL: `docker-compose.yml` e `Data/postgres`.
- Documentacao: `docs/` e `Frontend/web-app3/escala/docs`.

Arquivos e sinais avaliados:

- Manifestos: `package.json` do frontend, `pom.xml` do backend, `package.json` do Strapi.
- Rotas Next.js e BFF em `Frontend/web-app3/escala/src/app`.
- Controllers, services, entities, repositories e dominio de escala em `Backend/java-app1/demo/src/main/java/com/escala/authservice`.
- Content types Strapi em `Backend/cms-strapi/src/api`.
- Documentos existentes de arquitetura, requisitos, auditoria, OpenAPI, OKR e roadmap.

Nao foi feita auditoria juridica de CLT, Portaria 671, REP-P, LGPD ou CCT. Esses temas precisam de validacao juridica/DP antes de venda como conformidade plena.

## 3. Contexto competitivo

O mercado brasileiro de gestao de jornada possui players fortes em controle de ponto, RH e escalas. Concorrentes e alternativas relevantes incluem Escala, VR/Pontomais, Solides/Tangerino, TOTVS Ahgora, Convenia, Factorial, OiTchau, Coalize, Microsoft Shifts/Teams e solucoes genericas em planilhas.

Pontos recorrentes observados nos concorrentes:

- Criacao e publicacao de escalas online.
- Web e aplicativo.
- Distribuicao automatica de folgas.
- Alertas de infracoes trabalhistas.
- Trocas pelo aplicativo.
- Check-in/check-out.
- Banco de horas.
- Dimensionamento.
- Relatorios.
- Reconhecimento facial, geolocalizacao, assinatura de espelho de ponto e integracoes com folha/ERP.
- Forca enterprise em integracao corporativa e operacoes criticas.

Conclusao competitiva: ponto digital puro e um mercado com competidores fortes. A oportunidade do projeto esta em entrar por escala mensal simples e correta para PMEs, com backend como fonte da verdade, e evoluir para ponto/banco de horas sem deixar regra critica no frontend.

## 4. Estado atual do projeto

### 4.1 Frontend

Pontos fortes:

- Next.js 16, React 19, TypeScript, Tailwind, Radix, NextAuth, next-intl, next-themes, Zod, Zustand e `@brazilian-utils/brazilian-utils`.
- Rotas publicas e privadas com App Router.
- BFF em `src/app/api/bff/...`, incluindo auth, leads, escala, schedules, check-in, relatorios, auditoria, ReBAC, billing, AI, empresas, funcionarios, organizacao e work posts.
- Landing pages, campanhas, artigos, demo, contato, login, cadastro e convite.
- Dashboard privado com paginas para escala, auditoria, marketing, relatorios, empresas, setores, projetos, ReBAC, time e perfil.
- Camadas `core`, `features`, `infrastructure` e adapters ja presentes, embora ainda em migracao.

Lacunas:

- Organizacao por features ainda nao esta uniforme; ha mistura entre `components`, `services`, `core`, `features`, `infrastructure` e `dto`.
- A UI de escala existe, mas precisa evoluir para grid mensal com contadores, feriados configuraveis, alertas e publicacao/versionamento.
- O BFF existe e deve continuar obrigatorio; novas telas nao devem chamar backend diretamente do client.
- A landing e campanhas precisam reforcar nichos e prova de valor, evitando prometer modulo ainda parcial.

### 4.2 Backend Spring Boot

Pontos fortes:

- Spring Boot 4.1.0, Java 25, Maven, PostgreSQL, Security, JWT, BCrypt e Swagger manual via WebJar.
- Entidades para usuarios, roles, empresas, funcionarios, setores, projetos, escalas, trocas, ausencias, auditoria, ponto, leads, capacidade operacional, billing e IA usage.
- `TimeRecord` e `CheckInService` ja persistem registro de ponto basico com geolocalizacao, IP e device fingerprint.
- `MarketingLead` e `MarketingLeadService` ja capturam email, nome, empresa, consentimento, UTM, referrer, landing e campanha.
- Dominio puro inicial em `scheduling/domain`, com `LaborRuleEngine`, `SolicitacaoTrocaEscala`, `FluxoTrocaEscala` e testes.
- Regras iniciais para jornada diaria, semanal, mensal, intrajornada, interjornada, descanso semanal, 5x2, 6x1 e 12x36.
- ReBAC e escopo de gestor ja aparecem em services e controllers.

Lacunas:

- O backend ainda mistura arquitetura em camadas com partes hexagonais. A migracao para monolito modular deve ser gradual.
- `ScheduleController` ainda retorna entidades JPA em alguns endpoints. Para API publica/BFF, preferir DTOs estaveis.
- Escala mensal ainda precisa de entidade de ciclo/publicacao/versionamento, contadores e alertas persistidos.
- Feriados configuraveis por tenant/unidade ainda precisam virar dominio proprio.
- `TimeRecord` e check-in sao ponto web basico, nao um REP-P completo nem espelho de ponto assinado.
- Banco de horas ainda precisa de entidade, politicas, calculo, compensacao e relatorio.
- Lead atual nao captura ainda segmento, faixa de colaboradores, telefone normalizado, email pessoal/corporativo e versao de consentimento.
- OpenAPI manual precisa ser atualizado sempre que endpoints REST mudarem.

### 4.3 Strapi

Pontos fortes:

- Content types editoriais para landing pages, segmentos, features, planos, FAQ, artigos, categorias, autores, menus, footer, legal pages, lead forms e CTA.
- A estrutura permite landing pages por segmento/campanha e conteudo SEO.
- A decisao arquitetural correta e manter Strapi como CMS, nao como dono de usuarios finais ou regras operacionais.

Lacunas:

- `lead-form` no Strapi define formulario editorial, mas a persistencia do lead deve continuar no Spring Boot.
- Conteudo por segmento ainda precisa ser aprofundado para saude, seguranca, restaurantes, logistica, varejo, igrejas, tecnologia e facilities.
- Legal pages devem cobrir privacidade, termos, cookies, consentimento e tratamento de geolocalizacao/IA.

### 4.4 Docker, banco e DevOps

Pontos fortes:

- Docker Compose raiz orquestra frontend, backend, Strapi e PostgreSQL.
- PostgreSQL tem separacao de banco/usuario para backend e Strapi.
- Backend validado na branch de upgrade com Java 25 e Spring Boot 4.

Lacunas:

- CI/CD ainda precisa padronizar testes de backend, lint/typecheck/build de frontend e build do Strapi.
- Health checks, secrets por ambiente, backups e rollback precisam ser formalizados.
- Para producao, Java 25 LTS ainda deve ser tratado como decisao em validacao operacional.

## 5. Matriz de oportunidade

| Area | Mercado ja oferece | Estado do projeto | Oportunidade para o SaaS |
|---|---|---|---|
| Ponto digital | Muitos players fortes | Ponto web basico com geolocalizacao | Nao competir so por ponto; usar como extensao natural da escala |
| Escala inteligente | Players especializados | Calendario/escalas/trocas parciais | UX simples para PMEs e motor legal backend-first |
| Saude/hospitalar | Escala tem autoridade | Ainda sem profundidade vertical | Atacar tambem seguranca, facilities, igrejas, restaurantes, logistica e pequenas operacoes |
| Planilhas | Gratuitas, mas frageis | Produto ja tem base de calendario | Importar logica conhecida: mes, semana, feriados, contadores e templates |
| IA | Ainda pouco clara no segmento | IA mock e limites por plano em construcao | IA explicavel para conflitos, substituicoes e risco de escala |
| Campanhas/trial | Muitos exigem venda consultiva | Strapi, leads, UTM e billing parciais | PLG com trial, onboarding e segmentacao por porte/segmento |

## 6. Oceano Azul

### Eliminar

- Dependencia de planilhas paralelas.
- Trocas informais por WhatsApp sem historico.
- Regra trabalhista critica no frontend.
- Cadastro comercial sem UTM/referrer.
- Trial manual sem provisionamento.

### Reduzir

- Tempo de criacao da escala mensal.
- Retrabalho por feriados e contagem manual.
- Excesso de parametrizacao inicial para pequenas empresas.
- Custo de implantacao para PMEs.
- Risco de passivo por falta de alerta.

### Elevar

- Transparencia para colaborador.
- Auditabilidade e versionamento.
- Simplicidade do primeiro uso.
- Segmentacao comercial por porte e segmento.
- Qualidade dos relatorios para gestor/RH.

### Criar

- Assistente de escala para pequenas empresas.
- Templates por segmento: saude, seguranca, restaurante, igreja, logistica, varejo e tecnologia.
- Geracao mensal com feriados, contadores e alertas no backend.
- IA explicavel para conflitos e substituicoes.
- Trial orientado por dados de campanha e onboarding.

## 7. SWOT

### Forcas

- Arquitetura planejada como SaaS B2B multi-tenant.
- Backend Java como fonte da verdade.
- BFF obrigatorio, reduzindo exposicao de token e CORS.
- Strapi para conteudo e campanhas sem acoplar regra operacional.
- Base ja existente para usuarios, empresas, escalas, trocas, ponto, auditoria, leads, billing, ReBAC e IA mock.
- Possibilidade de comecar simples com PMEs e evoluir para operacao critica.
- Posicionamento claro em LGPD, auditoria e compliance.

### Fraquezas

- Produto ainda precisa provar maturidade operacional.
- Concorrentes ja possuem apps moveis, compliance e base de clientes.
- Regras trabalhistas variam por categoria, CCT e politica interna.
- Dimensionamento avancado exige dados de demanda confiaveis.
- Ponto eletronico completo pode exigir aderencia regulatoria mais profunda.
- Arquitetura hexagonal/modular ainda esta em evolucao.

### Oportunidades

- Empresas pequenas ainda usam Excel e WhatsApp.
- Segmentos fora de grandes hospitais sao menos atendidos por solucoes hiper-especializadas.
- IA pode reduzir esforco do gestor, desde que controlada e auditavel.
- Conteudo e campanhas segmentadas podem gerar aquisicao organica.
- Integracoes futuras com folha, WhatsApp oficial e ERPs podem aumentar retencao.

### Ameacas

- Players consolidados podem baixar preco ou empacotar escala/ponto.
- Mudancas legais e CCTs exigem atualizacao continua.
- LGPD e geolocalizacao elevam risco de compliance.
- PMEs podem ter baixa disposicao de pagar se o valor nao ficar claro.
- Concorrentes enterprise tem forca comercial e integracoes maduras.

## 8. 4Ps de Marketing

### Produto

Posicionamento: plataforma simples e segura para montar, validar, publicar e acompanhar escalas de trabalho, comecando com PMEs e evoluindo para operacoes criticas.

Pacotes sugeridos:

- Essencial: escala mensal, templates, feriados, contadores, publicacao e relatorios basicos.
- Profissional: banco de horas, trocas, ausencias, alertas avancados e dashboards.
- Operacao Critica: postos, geolocalizacao, dimensionamento, integracoes e auditoria avancada.
- Enterprise: integracoes, SLAs, regras customizadas, consultoria e implantacao assistida.

### Preco

Modelo por colaborador/mes com minimo por plano:

- Essencial: R$ 9,90 por colaborador, minimo R$ 99.
- Profissional: R$ 16,90 por colaborador, minimo R$ 249.
- Operacao Critica: R$ 29,90 por colaborador, minimo R$ 499.
- Enterprise: sob consulta.

Trial:

- Self-service: 14 dias.
- Qualificado: 30 dias.
- Piloto assistido: 60 a 90 dias.
- IA trial: 7 dias ou 20 consultas.

### Praca

- Site publico e landing pages por segmento.
- Trial self-service com Google SSO.
- Conteudo Strapi para SEO: escala 5x2, 6x1, 12x36, banco de horas, feriados, ponto, DSR e interjornada.
- Campanhas por segmentos: saude, seguranca, restaurante, logistica, varejo, igrejas, tecnologia e facilities.
- Futuro marketplace de integracoes com folha/ERP.

### Promocao

- Calculadora de economia de tempo e horas extras.
- Templates gratuitos de escala em troca de lead.
- Cases ficticios/anonimizados proprios no inicio; depois cases reais.
- Campanhas com UTM e landing pages especificas.
- Conteudo comparativo: Excel vs sistema de escala, erro de feriado, 6x1 sem passar de seis dias seguidos.
- Demonstracao guiada para segmentos com maior ticket.

## 9. Nichos prioritarios

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

## 10. Mensagens de campanha

- "Pare de conferir escala no braco: dias, feriados e contadores automaticos."
- "Monte 5x2, 6x1 e 12x36 sem depender de formulas frageis no Excel."
- "Sua escala publicada, auditavel e segura para gestor e colaborador."
- "Comece simples, evolua para banco de horas, ponto, postos e IA."
- "Escala com backend como fonte da verdade: menos risco de erro e mais confianca."

## 11. Riscos e mitigacao

| Risco | Mitigacao |
|---|---|
| Complexidade legal por CCT | Motor parametrizavel por tenant/categoria e aviso de validacao juridica |
| Concorrentes maduros | Foco em UX simples, PLG e nichos negligenciados |
| Baixa conversao de trial | Onboarding segmentado, templates prontos e dados de exemplo |
| LGPD/geolocalizacao | Consentimento explicito, minimizacao, retencao e auditoria |
| Escopo excessivo | Roadmap por fases e criterios de aceite por modulo |
| Marketing prometer alem do produto | Matriz publica de modulos prontos, beta e planejados |

## 12. Prioridades recomendadas

1. Consolidar escala mensal com templates, feriados, contadores e validacao backend.
2. Evoluir lead/trial com segmento, faixa de colaboradores, telefone, email corporativo e consentimentos versionados.
3. Criar publicacao/versionamento/auditoria de escala.
4. Fechar fluxo de troca com aceite do colega e aprovacao do gestor.
5. Transformar ponto web basico em modulo confiavel antes de prometer conformidade ampla.
6. Introduzir IA apenas como explicacao/sugestao auditavel, sem decisao automatica critica.
