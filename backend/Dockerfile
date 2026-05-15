FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/property-management-backend-0.1.0-SNAPSHOT.jar ./app.jar
COPY --from=build /app/target/lib ./lib
EXPOSE 8080
CMD ["java", "-cp", "app.jar:lib/*", "com.eba.common.config.PropertyManagementServer"]

