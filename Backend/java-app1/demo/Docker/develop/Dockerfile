FROM maven:3.9-eclipse-temurin-25

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

# Development command: runs with hot-reload if configured
CMD ["mvn", "spring-boot:run"]
