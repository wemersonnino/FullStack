# Segredos versionados e rotacao - issue 49

## Decisao

Arquivos `.env` locais sao necessarios para desenvolvimento, mas nao podem permanecer rastreados. Eles devem existir apenas no disco de cada desenvolvedor e ser criados a partir de arquivos `*.example` com placeholders explicitamente invalidos.

## Acao aplicada

- Removidos do indice Git os `.env` rastreados encontrados em `Data/postgres/.env.local` e `Frontend/web-app1/.env`, sem apagar as copias locais quando presentes no workspace.
- Removida a senha explicita do Compose legado do CMS; a variavel `STRAPI_DB_PASSWORD` passa a ser obrigatoria no `.env` local.
- Removidos fallbacks de JWT no codigo do Strapi; a ausencia de `JWT_SECRET` agora falha de forma explicita.
- Sanitizados exemplos e documentacao que continham valores que pareciam credenciais.
- Adicionado gate de CI `Security / Versioned Secret Scan` para bloquear regressao em arquivos rastreados.

## Historico e rotacao

Apagar um segredo do `HEAD` nao o remove dos commits antigos. Os valores encontrados no historico devem ser considerados expostos e nao devem ser reutilizados fora do desenvolvimento local.

Nao ha credencial de producao disponivel neste repositorio para rotacao automatica. O responsavel por cada ambiente deve rotacionar quaisquer valores que tenham sido copiados para servicos externos e registrar a conclusao no PR da issue 49. Reescrita do historico Git exige coordenacao com todos os clones, forks e pipelines e fica fora desta alteracao para evitar interrupcao e perda de referencias.

## Validacao

```powershell
powershell -NoProfile -File scripts/security/check-versioned-secrets.ps1
docker compose --env-file .env.compose.example config --quiet
```
