#!/bin/sh
set -eu

create_role_and_database() {
  database_name="$1"
  database_user="$2"
  database_password="$3"

  psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    --set=database_name="$database_name" \
    --set=database_user="$database_user" \
    --set=database_password="$database_password" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'database_user', :'database_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'database_user')\gexec
SELECT format('CREATE DATABASE %I OWNER %I', :'database_name', :'database_user')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'database_name')\gexec
SELECT format('ALTER DATABASE %I OWNER TO %I', :'database_name', :'database_user')\gexec
SQL

  psql --username "$POSTGRES_USER" --dbname "$database_name" \
    --set=database_user="$database_user" <<'SQL'
SELECT format('ALTER SCHEMA public OWNER TO %I', :'database_user')\gexec
SELECT format('GRANT ALL ON SCHEMA public TO %I', :'database_user')\gexec
SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %I', :'database_user')\gexec
SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %I', :'database_user')\gexec
SQL
}

: "${ESCALA_DB_NAME:?ESCALA_DB_NAME is required}"
: "${ESCALA_DB_USER:?ESCALA_DB_USER is required}"
: "${ESCALA_DB_PASSWORD:?ESCALA_DB_PASSWORD is required}"
: "${STRAPI_DB_NAME:?STRAPI_DB_NAME is required}"
: "${STRAPI_DB_USER:?STRAPI_DB_USER is required}"
: "${STRAPI_DB_PASSWORD:?STRAPI_DB_PASSWORD is required}"

create_role_and_database "$ESCALA_DB_NAME" "$ESCALA_DB_USER" "$ESCALA_DB_PASSWORD"
create_role_and_database "$STRAPI_DB_NAME" "$STRAPI_DB_USER" "$STRAPI_DB_PASSWORD"
