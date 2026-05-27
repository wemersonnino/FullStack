# Analise de Modularizacao do Sistema de Escalas

## Situacao atual

O projeto ja possui separacao operacional entre frontend Next.js, backend Spring Boot, Strapi CMS e PostgreSQL. A comunicacao principal tambem esta alinhada com a diretriz do produto: o frontend consome o backend Spring/BFF para dados autenticados, enquanto o Strapi fica restrito ao conteudo editorial.

Ainda assim, o codigo da escala nao esta totalmente em arquitetura hexagonal. O backend segue majoritariamente uma arquitetura em camadas por tipo de arquivo (`controller`, `service`, `entity`, `repository`). Isso funciona para MVP, mas mistura dominio, persistencia e transporte HTTP.

No frontend, a estrutura atual separa `app`, `components`, `services`, `interfaces` e `lib`, mas ainda nao esta organizada por features/bounded contexts. Componentes de tela ainda chamam services diretamente em alguns pontos.

## Lacunas principais

- Dominio do backend ainda usa entidades JPA como modelo de negocio.
- Controllers retornam entidades de persistencia diretamente.
- Services Spring concentram orquestracao, regras de negocio e acesso a repositorio.
- Nao existem portas de entrada/saida explicitas para casos de uso de escala.
- Frontend ainda usa organizacao por tipo, com pouca fronteira entre UI, caso de uso e infraestrutura.
- Regras como lotacao, cobertura minima, feriados, licencas, fluxo de aprovacao em duas etapas, auditoria e notificacoes ainda nao estao modeladas.

## Direcao recomendada

Backend: evoluir para monolito modular com pacotes por contexto:

- `iam`: usuarios, roles, autenticacao e sessoes.
- `organization`: empresas, setores, projetos e funcionarios.
- `scheduling`: geracao de escalas, presenca/remoto, ausencias e calendario.
- `shiftnegotiation`: solicitacoes de troca e maquina de estados.
- `notification`: envio de email, push, Slack/Teams.
- `audit`: trilha de auditoria e soft delete.

Cada modulo deve ter:

- `domain`: Java puro, sem Spring/JPA.
- `application`: casos de uso e portas.
- `adapters`: REST, JPA, mensageria e integracoes.
- `config`: wiring Spring.

Frontend: evoluir para features:

- `features/auth`
- `features/schedules`
- `features/shift-swaps`
- `features/employees`
- `shared`

Cada feature deve isolar API, hooks/casos de uso, tipos e componentes especificos.

## Passo implementado

Foi criado o primeiro limite de dominio puro para troca de escala:

- Backend: `scheduling/domain/model/SolicitacaoTrocaEscala`
- Backend: `scheduling/domain/exception/TrocaInvalidaException`
- Backend: testes unitarios da regra de troca
- Frontend: `features/shift-swaps` com API/hook para submissao de troca

Esse passo nao reestrutura todo o sistema, mas introduz o padrao que deve guiar as proximas migracoes sem quebrar os endpoints existentes.
