# Limpeza do Strapi duplicado — issue 42

## Diagnostico

Uma instalacao Strapi local foi criada diretamente em `Backend/` em 2026-08-25. Ela nao fazia parte do historico Git, mas o `docker-compose.yml` legado apontava para `./backend`, fazendo o servico chamado `backend` tentar construir e executar esse CMS na porta 1337.

O CMS oficial e versionado permanece em `Backend/cms-strapi`. O backend oficial e `Backend/java-app1/demo`.

## Inventario comparativo

Foram comparados por caminho e SHA-256 todos os arquivos locais da raiz `Backend/`, excluindo `cms-strapi` e `java-app1`:

| Classificacao | Quantidade | Decisao |
| --- | ---: | --- |
| Identicos ao CMS oficial | 19 | Remover a copia local |
| Diferentes | 7 | Manter a versao oficial apos revisao semantica |
| Exclusivos dos residuos | 13 | Nao migrar; remover conforme justificativa abaixo |

Arquivos diferentes revisados:

- `.env.example`: a copia legada usava o banco generico `escala`; a configuracao oficial usa banco dedicado do CMS.
- `config/database.ts`: o CMS oficial ja usa `strapi_cms` e `strapi_user`.
- `config/server.ts`: o CMS oficial possui tarefas cron controladas por ambiente.
- `package.json`/lockfile: o CMS oficial possui dependencias e scripts adicionais usados pelo bootstrap editorial.
- `announcement/schema.json`: a versao oficial modela conteudo editorial com slug, midia e categoria; a copia legada misturava targeting de usuarios finais.
- `src/index.ts`: a versao oficial restringe permissoes publicas e executa bootstrap editorial.

## Conteudo exclusivo descartado

Os content types `audit-log`, `schedule` e `shift` existiam somente nos residuos. Eles nao foram migrados porque representam auditoria, escalas e turnos operacionais, responsabilidades exclusivas do Spring Boot segundo a arquitetura vigente. Migrar esses schemas para o Strapi recriaria duas fontes de verdade e permitiria contornar autorizacao e isolamento multi-tenant.

O `Dockerfile` exclusivo da raiz tambem foi descartado: ele construia Strapi a partir de `Backend/`, caminho que nao e mais suportado.

## Resultado esperado

- Nenhuma aplicacao Strapi deve existir diretamente em `Backend/`.
- O Compose local constroi Spring Boot de `Backend/java-app1/demo` e Strapi de `Backend/cms-strapi`.
- Spring Boot e Strapi usam bancos e usuarios PostgreSQL separados.
- Segredos reais ficam em `.env` ignorado; somente placeholders sao versionados.
- O job `CMS / Build` do CI continua executando em `Backend/cms-strapi`.

## Seguranca

Os arquivos `Backend/java-app1/demo/.env`, `Backend/cms-strapi/.env.local` e `Data/postgres/.env` estavam versionados e foram removidos do indice sem apagar as copias locais. Como os valores permanecem no historico anterior do Git, todos os segredos neles presentes devem ser rotacionados. Reescrever o historico fica fora desta issue por ser uma operacao destrutiva e coordenada.
