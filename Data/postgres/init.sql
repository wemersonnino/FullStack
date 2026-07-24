-- Inicializacao local/Docker do PostgreSQL para o projeto Escala.
-- Pode ser reexecutado com psql: comandos de criacao usam checagem de existencia.

-- Usuarios das aplicacoes
SELECT 'CREATE USER strapi_user WITH ENCRYPTED PASSWORD ''strapi1234567890'''
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'strapi_user')\gexec

SELECT 'CREATE USER escala_api_user WITH ENCRYPTED PASSWORD ''escala_api_password'''
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'escala_api_user')\gexec

SELECT 'CREATE USER dotnet_user WITH ENCRYPTED PASSWORD ''dotnet1234567890'''
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'dotnet_user')\gexec

-- Banco do Strapi (CMS: conteudo, SEO, menus, URLs editoriais)
SELECT 'CREATE DATABASE strapi_cms OWNER strapi_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'strapi_cms')\gexec

ALTER DATABASE strapi_cms OWNER TO strapi_user;
GRANT ALL PRIVILEGES ON DATABASE strapi_cms TO strapi_user;

\connect strapi_cms;

-- Permissoes adicionais para Strapi
ALTER SCHEMA public OWNER TO strapi_user;
GRANT ALL ON SCHEMA public TO strapi_user;
GRANT USAGE, CREATE ON SCHEMA public TO strapi_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO strapi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO strapi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO strapi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO strapi_user;

-- Banco principal da aplicacao Escala (Spring Boot)
\connect postgres;

SELECT 'CREATE DATABASE escala_core OWNER escala_api_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'escala_core')\gexec

ALTER DATABASE escala_core OWNER TO escala_api_user;
GRANT ALL PRIVILEGES ON DATABASE escala_core TO escala_api_user;

\connect escala_core;

-- Permissoes adicionais para a API Java
ALTER SCHEMA public OWNER TO escala_api_user;
GRANT ALL ON SCHEMA public TO escala_api_user;
GRANT USAGE, CREATE ON SCHEMA public TO escala_api_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO escala_api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO escala_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO escala_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO escala_api_user;

-- Banco para API .NET
\connect postgres;

SELECT 'CREATE DATABASE intranet_api OWNER dotnet_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'intranet_api')\gexec

ALTER DATABASE intranet_api OWNER TO dotnet_user;
GRANT ALL PRIVILEGES ON DATABASE intranet_api TO dotnet_user;

\connect intranet_api;

-- Permissoes adicionais para a API .NET
ALTER SCHEMA public OWNER TO dotnet_user;
GRANT ALL ON SCHEMA public TO dotnet_user;
GRANT USAGE, CREATE ON SCHEMA public TO dotnet_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dotnet_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dotnet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dotnet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dotnet_user;
