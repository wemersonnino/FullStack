FROM maven:3.9-eclipse-temurin-25

WORKDIR /app

ENV HOME=/tmp \
    MAVEN_CONFIG=/tmp/.m2 \
    MAVEN_USER_HOME=/tmp/.m2

RUN groupadd --gid 10001 app \
    && useradd --uid 10001 --gid app --home-dir /tmp --no-create-home --shell /usr/sbin/nologin app \
    && mkdir -p /tmp/.m2 \
    && chown -R app:app /app /tmp/.m2

COPY --chown=app:app pom.xml .
COPY --chown=app:app src ./src

USER app

# Em desenvolvimento, o backend nao precisa compilar nem resolver
# dependencias de teste a cada restart do container.
CMD ["mvn", "-Dmaven.test.skip=true", "spring-boot:run"]
