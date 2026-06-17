FROM postgres:16.0-alpine
# Develop might include extra tools or loose permissions
COPY init.sql /docker-entrypoint-initdb.d/
