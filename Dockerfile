## Multi-stage build for Spring Boot 3 (Java 21)

FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace

# Leverage Gradle wrapper
COPY gradlew .
COPY gradle gradle
RUN chmod +x gradlew

# Copy build descriptors first for better layer caching
COPY build.gradle settings.gradle ./

# Copy sources
COPY src src

# Build fat jar (skip tests in container build)
RUN ./gradlew --no-daemon clean bootJar -x test


FROM eclipse-temurin:21-jre AS run
ENV TZ=Asia/Seoul
WORKDIR /app

# Create non-root user
RUN useradd -ms /bin/bash spring
USER spring

COPY --from=build /workspace/build/libs/*.jar /app/app.jar

EXPOSE 8080

# Tune JVM for container; make profile explicit
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -Duser.timezone=Asia/Seoul"
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java","-jar","/app/app.jar"]

