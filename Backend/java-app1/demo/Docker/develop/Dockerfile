FROM maven:3.9-eclipse-temurin-25

WORKDIR /app

COPY pom.xml .
# COPY src para build rápido
COPY src ./src

# Executa o boot-run em runtime
CMD ["mvn", "spring-boot:run"]
