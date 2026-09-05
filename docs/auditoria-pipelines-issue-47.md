# Auditoria de pipelines da issue 47

## Escopo e metodo

Inventario versionado dos fluxos local, Docker e CI, levantado sobre
`origin/develop` no inicio da issue 47. A auditoria considera instalacao,
compilacao, testes, geracao de artefatos, contextos e volumes. Contratos REST,
frameworks, gerenciadores de pacotes e cobertura funcional nao foram alterados.

## Inventario e decisoes

| Ambiente | Redundancia ou risco | Impacto | Responsavel | Decisao |
| --- | --- | --- | --- | --- |
| CI backend | `mvn test` seguido de `mvn package -DskipTests` em dois containers | duas inicializacoes Maven e repeticao das fases anteriores ao package | job `Backend / Unit and Build` | executar uma vez `mvn -B package`; os testes unitarios continuam obrigatorios e o JAR e gerado na mesma execucao |
| CI integracao | suite com perfil `integration` separada da suite unitaria | separacao justificada por Docker/Testcontainers e diagnostico independente | job `Backend / Integration` | manter job e verificacao explicita de relatorios; nao e duplicacao da suite unitaria |
| CI frontend | instalacao, lint, typecheck e build no mesmo container | uma unica instalacao alimenta tres gates | job `Frontend / Quality and Build` | manter consolidado; ainda nao ha suite automatizada confiavel para adicionar |
| CI CMS | instalacao e build no mesmo container | uma unica instalacao por job | job `CMS / Build` | manter sem jobs sobrepostos |
| Gatilhos CI | o merge em `develop` disparava `push` e o PR de promocao disparava o mesmo workflow para o mesmo SHA | duas suites completas simultaneas, com custo e checks duplicados | workflow do monorepo | manter PRs para `develop`/`main`, push somente em `main` e disparo manual; governanca proibe push direto em `develop` |
| Docker local frontend | Dockerfile preparava Corepack, mas o Compose executava `pnpm install` em todo start/restart | restart dependente de rede e do tempo de instalacao; volume podia esconder os modulos da imagem | Dockerfile de desenvolvimento | instalar no build da imagem; o volume nomeado `/app/node_modules` e inicializado pela imagem; o container executa somente `pnpm dev` |
| Docker local backend | imagem contem fontes e usa cache Maven nomeado | rebuild resolve codigo; restart nao recompila nem reinstala | Dockerfile de desenvolvimento | manter; o cache acelera rebuilds e nao esconde artefato de runtime |
| Docker local CMS | dependencias ficam em `/opt/node_modules` e somente fontes/config/uploads sao montados | evita que bind mount esconda dependencias da imagem | Dockerfile de desenvolvimento | manter volumes seletivos; uploads continuam persistentes no host local |
| Compose por componente | dois Compose historicos sobrepunham a raiz e apontavam para `Docker/Dockerfile`, inexistente | fluxos quebrados e responsabilidade ambigua | Compose raiz | remover os dois arquivos; a raiz passa a ser a unica orquestracao suportada |
| Contexto backend | metadados de IDE, wrapper e configuracao Maven local podiam entrar no contexto | transferencia e invalidacao de cache sem uso pela imagem | `.dockerignore` do backend | excluir `.github`, `.mvn`, `.settings`, wrapper e metadados Eclipse |
| Contexto frontend | caches de ferramentas e relatorios regeneraveis nao estavam todos excluidos | contexto maior e cache Docker invalidado por saidas locais | `.dockerignore` do frontend | excluir Turbo, ESLint, Playwright, resultados de teste e logs pnpm |
| Contexto CMS | caches TypeScript/ESLint e uploads locais podiam entrar na imagem | dados mutaveis e artefatos locais no contexto de build | `.dockerignore` do CMS | excluir caches, cobertura e uploads, preservando apenas `.gitkeep` |
| Producao/homolog | cada Dockerfile instala e compila seu proprio componente | necessario para imagem imutavel; nao existe volume escondendo build | Dockerfiles de cada ambiente | manter; homolog e producao sao destinos distintos com a mesma responsabilidade |

## Matriz de responsabilidade resultante

| Componente | Desenvolvimento | CI | Homolog/producao |
| --- | --- | --- | --- |
| Backend | Docker build prepara a imagem; `spring-boot:run` inicia o processo | `mvn package` testa e empacota; perfil `integration` valida Testcontainers em job proprio | multi-stage Docker executa `mvn package -DskipTests`, pois os gates pertencem ao CI |
| Frontend | Docker build executa um `pnpm install`; restart executa apenas `pnpm dev` | uma instalacao alimenta lint, typecheck e build | multi-stage Docker instala e compila uma vez por imagem |
| CMS | Docker build executa um `npm ci`; restart executa apenas `npm run develop` | uma instalacao alimenta o build | multi-stage Docker instala e compila uma vez por imagem |

## Evidencia antes/depois

Medicao local em Windows 11, Docker Desktop Engine 29.7.2 e Compose 5.3.1. Os
tempos variam com maquina, rede e cache; por isso a evidencia principal e a
contagem deterministica de etapas. Os contextos foram medidos pelo BuildKit em
um worktree imutavel de `origin/develop` e novamente na branch da issue.

| Medida | Antes | Depois | Resultado |
| --- | ---: | ---: | --- |
| invocacoes Maven no job unit/build | 2 | 1 | -50% e o mesmo teste/package |
| instalacoes pnpm por restart do frontend | 1 | 0 | instalacao removida do caminho de restart |
| Compose suportados para a stack | 3 (1 valido, 2 historicos quebrados) | 1 | entrada operacional unica |
| suites CI simultaneas no mesmo SHA ao promover `develop` | 2 | 1 | elimina duplicacao `push develop` + `pull_request main` |
| contexto Docker backend | 852,32 kB | 852,32 kB | checkout limpo igual; arquivos locais Maven/IDE agora excluidos |
| contexto Docker frontend | 3,37 MB | 3,37 MB | checkout limpo igual; caches e relatorios locais agora excluidos |
| contexto Docker CMS | 11,36 MB | 11,36 MB | checkout limpo igual; uploads e caches locais agora excluidos |

Os tamanhos iguais no checkout limpo sao esperados: as novas classes ignoradas
sao artefatos locais nao versionados e estavam ausentes nos dois worktrees. O
ganho aparece depois que as ferramentas geram esses artefatos, sem remover
nenhuma entrada versionada necessaria as imagens.

## Registro de validacao

- `docker compose --env-file .env.compose.example config --quiet`: aprovado.
- `mvn -B package` equivalente ao CI: aprovado, com 118 testes unitarios e JAR
  na mesma invocacao Maven; tempo de cache frio de 4m51s.
- Imagem de desenvolvimento backend: build aprovado, contexto de 852,32 kB.
- Frontend e CMS acessaram a registry somente com a CA corporativa atual. Os
  PEMs salvos em `C:\certs` nao correspondem a CA apresentada nesta sessao e as
  instalacoes ficaram retidas pela inspecao TLS do endpoint. Nao houve erro de
  fonte ou lockfile antes da interrupcao controlada.
- O perfil de integracao executou os 118 testes unitarios, mas as cinco classes
  Testcontainers nao conseguiram anexar ao proxy de socket do Docker Desktop
  nesta sessao Windows. O job Linux de CI e sua verificacao fail-closed foram
  preservados sem reducao de cobertura.

Para reproduzir a transferencia efetiva com o cache atual, use
`docker build --progress=plain --check -f <Dockerfile> <contexto>` e registre a
linha `transferring context`. Para medir o ciclo de vida:

```bash
docker compose --env-file .env.compose.example config --quiet
docker compose --env-file .env.compose.example up -d --build
docker compose ps
docker compose restart
docker compose ps
```

No segundo ciclo, os logs do frontend nao devem conter `pnpm install`; backend e
CMS tambem devem apenas reiniciar seus processos. Volumes de dados nao devem ser
removidos durante essa validacao.

## Rollback

Reverter o commit da issue restaura o comando de instalacao no start, os Compose
historicos, os ignores anteriores e as duas invocacoes Maven. Nenhuma migration,
contrato REST, dependencia ou dado persistido e alterado por esta entrega.
