FROM postgres:16.0-alpine
# Develop might include extra tools or loose permissions
COPY init-multiple-databases.sh /docker-entrypoint-initdb.d/10-init-multiple-databases.sh
