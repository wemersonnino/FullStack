FROM postgres:16.0-alpine
# Hardened for production
COPY init.sql /docker-entrypoint-initdb.d/
# In production, we might want to restrict shell access or include monitoring agents
