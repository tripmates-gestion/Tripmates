FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /home/app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre AS deploy

WORKDIR /home/app
COPY sample_images ./sample_images
COPY --from=build /home/app/target/*.jar app.jar

EXPOSE ${BACKEND_PORT}

ENTRYPOINT ["java", "-jar", "app.jar"]