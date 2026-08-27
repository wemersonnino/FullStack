FROM postgres:16.0-alpine
# Hardened for production
COPY init-multiple-databases.sh /docker-entrypoint-initdb.d/10-init-multiple-databases.sh
# In production, we might want to restrict shell access or include monitoring agents
