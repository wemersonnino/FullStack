-- Banco do Strapi
CREATE DATABASE strapi_cms;

\connect strapi_cms;

CREATE USER strapi_user WITH ENCRYPTED PASSWORD 'strapi1234567890';
GRANT ALL PRIVILEGES ON DATABASE strapi_cms TO strapi_user;

-- 🧩 Permissões adicionais para Strapi
GRANT ALL ON SCHEMA public TO strapi_user;
ALTER SCHEMA public OWNER TO strapi_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO strapi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO strapi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO strapi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO strapi_user;


-- Banco para API Java
CREATE DATABASE web_app_api;

\connect web_app_api;

CREATE USER api_user WITH ENCRYPTED PASSWORD 'webappapi1234567890';
GRANT ALL PRIVILEGES ON DATABASE web_app_api TO api_user;

-- 🧩 Permissões adicionais para a API Java
GRANT ALL ON SCHEMA public TO api_user;
ALTER SCHEMA public OWNER TO api_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO api_user;


-- Banco para API .NET
CREATE DATABASE intranet_api;

\connect intranet_api;

CREATE USER dotnet_user WITH ENCRYPTED PASSWORD 'dotnet1234567890';
GRANT ALL PRIVILEGES ON DATABASE intranet_api TO dotnet_user;

-- 🧩 Permissões adicionais para a API .NET
GRANT ALL ON SCHEMA public TO dotnet_user;
ALTER SCHEMA public OWNER TO dotnet_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dotnet_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dotnet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dotnet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dotnet_user;
