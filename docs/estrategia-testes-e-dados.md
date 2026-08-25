# Estrategia de testes, seeds e dados fake

Data: 2026-07-01

## 1. Pergunta central

Estamos usando “dados mocados” para a aplicacao funcionar?

Resposta curta:

- **Nos testes unitarios, sim, e isso esta correto.**
- **Na aplicacao em runtime, quase tudo relevante ja usa backend e banco real.**
- **Ainda existem alguns fallbacks e adapters fake fora do escopo de teste que devem ser tratados explicitamente.**

O erro conceitual e misturar tres coisas diferentes:

- **Mock de teste unitario**: substitui dependencias para validar uma regra isolada.
- **Seed de desenvolvimento**: cria dados demo para subir o ambiente local.
- **Fake de produto/runtime**: faz a aplicacao parecer pronta sem depender do backend real.

Essas tres categorias nao devem ser tratadas como se fossem a mesma coisa.

## 2. Onde mocks continuam corretos

Os arquivos em `Backend/java-app1/demo/src/test/java/...` usando `@Mock`, `when(...)`, `verify(...)` e `@InjectMocks` sao **testes unitarios**.

Exemplos:

- `AuthenticationServiceTest`
- `TeamInvitationServiceTest`
- `ScheduleCyclePublicationServiceTest`

Por que isso e correto:

- valida regra de negocio sem depender de banco, Redis, rede ou tempo de resposta
- permite cobrir casos extremos e erros de forma deterministica
- deixa o feedback de build rapido

Conclusao:

- **Nao devemos remover esses mocks unitarios e trocar tudo por banco real.**
- O correto e **complementar** com testes de integracao.

## 3. Onde precisamos de banco e infraestrutura real

Para os cenarios abaixo, mocks unitarios nao bastam:

- constraints de unicidade por tenant
- comportamento real de queries e indices
- filtros JWT e chain de seguranca
- persistencia JPA/Hibernate
- migracoes Flyway
- locks Redis
- rate limit com concorrencia
- comportamento HTTP real dos controllers/BFF

Para isso, a recomendacao oficial passa a ser:

### 3.1 Testes de integracao backend

Usar banco PostgreSQL real para validar:

- `unique(company_id, lower(email))`
- backfill/migracao de `tokenHash`
- repositorios JPA
- autenticacao real
- endpoints REST protegidos
- comportamento de auditoria e soft-delete

Estado atual nesta branch:

- existe suite de integracao baseada em **Testcontainers** em `Backend/java-app1/demo/src/test/java/com/escala/authservice/integration/`
- os cenarios cobertos hoje sao:
  - unicidade por tenant para `users` e `employees`
  - convites com `tokenHash` e desativacao de convite anterior no mesmo tenant
  - lock distribuido com Redis
  - publicacao, retificacao e arquivamento de ciclo
- `mvn test` executa a suite unitaria rapida e exclui `integration/**`; este e o modo local sem Docker
- `mvn -Pintegration verify` executa obrigatoriamente testes unitarios e de integracao; se o Docker estiver indisponivel, o build **falha**, nunca fica verde por `skip`

#### Docker Desktop 29 no Windows

O Testcontainers 1.21.3 precisa usar uma API Docker compativel e o socket do
engine Linux do Docker Desktop. No PowerShell:

```powershell
$env:DOCKER_HOST='npipe:////./pipe/dockerDesktopLinuxEngine'
.\mvnw.cmd '-Dapi.version=1.44' -Pintegration verify
```

`DOCKER_API_VERSION` no ambiente nao substitui `-Dapi.version=1.44` neste
cliente. Em Linux/CI, onde o socket padrao e reconhecido, basta
`./mvnw -Pintegration verify`.

As migrations Flyway sao a fonte do schema. O profile `test` mantem
`spring.jpa.hibernate.ddl-auto=validate`, de modo que cada execucao parte de
um PostgreSQL vazio, aplica todas as migrations e falha se qualquer entidade
JPA divergir do banco.

### 3.2 Testes de integracao Redis

Usar Redis real para validar:

- `DistributedLockService`
- rate limit de borda
- expiracao de chaves
- comportamento concorrente

### 3.3 Seeds de QA e smoke test

Em vez de depender de mocks para demonstrar comportamento funcional, podemos ter:

- seed SQL ou fixture controlada para tenants pequenos
- seed SQL ou fixture controlada para tenants grandes
- cenarios com convites, escalas, trocas, feriados e ciclos
- massa mascarada para smoke tests

## 4. Estado atual: o que ja e real na aplicacao

Hoje a aplicacao ja usa backend/banco real para:

- autenticacao principal
- usuarios, empresas e funcionarios
- convites
- escalas e ciclos
- trocas
- leads
- ponto web basico
- auditoria
- billing base
- configuracoes operacionais principais

Ou seja: **a aplicacao nao esta “rodando com dados mocados” como base principal de negocio**.

## 5. O que ainda e fake/fallback fora de teste

### 5.1 IA mock no backend

Arquivo:

- `Backend/java-app1/demo/src/main/java/com/escala/authservice/core/ai/adapter/MockAiAdapter.java`

Classificacao:

- fake de produto/runtime

Acao recomendada:

- manter apenas atras de feature flag ou profile de development
- substituir por provider real quando a frente de IA sair do modo demonstrativo

### 5.2 Fallback estatico de landing page no frontend

Arquivo:

- `Frontend/web-app3/escala/src/dto/landing.dto.ts`

Classificacao:

- fallback de conteudo para resiliencia quando o Strapi nao responder

Acao recomendada:

- aceitavel apenas como resiliencia controlada
- o caminho principal correto passou a ser `backend -> BFF -> UI`
- nesta branch, `landing`, `pricing plans` e `testimonials` ja nao dependem mais de chamada direta do frontend ao Strapi
- o fallback ainda existe como contingencia, mas nao e mais a rota principal de integracao

### 5.3 Seed de desenvolvimento no backend

Arquivo:

- `Backend/java-app1/demo/src/main/java/com/escala/authservice/config/DataInitializer.java`

Classificacao:

- seed local/demo

Acao recomendada:

- manter para produtividade local
- nao tratar como dado real de homolog/producao
- eventualmente mover para profile ou flag mais explicita de demo seed

### 5.4 Flags “mock-” de Google no frontend

Arquivo:

- `Frontend/web-app3/escala/src/app/api/auth/[...nextauth]/route.ts`

Classificacao:

- controle para nao ativar Google SSO de verdade com credencial fake

Acao recomendada:

- manter como guarda de ambiente
- nao e problema de dado fake de negocio

## 6. Estrategia recomendada daqui para frente

### Manter

- testes unitarios com mocks para services e dominio

### Adicionar

- testes de integracao com PostgreSQL
- testes de integracao com Redis
- fixtures/seed de QA
- smoke tests HTTP reais sobre backend e BFF
- migracao gradual dos services publicos que ainda falam direto com CMS para `backend -> BFF -> UI`

### Reduzir

- adapters fake de produto em runtime
- fallbacks editoriais em ambientes acima de development

## 7. Decisao pratica

Se a pergunta for “devemos parar de usar `@Mock` nos testes?”:

- **Nao.**

Se a pergunta for “devemos confiar apenas em testes com mocks para validar backend multitenant, banco e locks?”:

- **Tambem nao.**

O caminho correto e:

1. manter unit tests com mocks
2. adicionar integration tests com banco/Redis reais
3. usar seed de teste controlada para validar comportamento end-to-end
