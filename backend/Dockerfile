FROM maven:3.9.6-eclipse-temurin-17 AS dependencies
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline

FROM dependencies AS build
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-alpine AS production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app && mkdir -p /data/uploads && chown -R app:app /app /data
COPY --from=build --chown=app:app /app/target/*.jar /app/app.jar
USER app
EXPOSE 8080
ENV SPRING_DEVTOOLS_RESTART_ENABLED=false
ENV SPRING_DEVTOOLS_ADD_PROPERTIES=false
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

FROM dependencies AS dev
COPY . .
EXPOSE 8080
CMD ["sh", "-c", "rm -f /app/target/classes/db/migration/V4__survey_enhancements.sql && mvn spring-boot:run -Dspring-boot.run.jvmArguments='-Dspring.devtools.restart.enabled=false -Dspring.devtools.add-properties=false'"]
