FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /app

COPY pom.xml ./

# Warm up dependencies first and retry on transient network failures.
RUN set -eux; \
		for i in 1 2 3 4 5; do \
			mvn -B -ntp -DskipTests -Dmaven.wagon.http.retryHandler.count=5 dependency:go-offline && break; \
			echo "[WARN] Maven dependency download failed (attempt ${i}/5). Retrying..."; \
			rm -rf /root/.m2/repository/com/github/luben/zstd-jni; \
			if [ "$i" -eq 5 ]; then exit 1; fi; \
		done

COPY src ./src

RUN set -eux; \
		for i in 1 2 3 4 5; do \
			mvn -B -ntp -DskipTests -Dmaven.wagon.http.retryHandler.count=5 clean package && break; \
			echo "[WARN] Maven package step failed (attempt ${i}/5). Retrying..."; \
			rm -rf /root/.m2/repository/com/github/luben/zstd-jni; \
			if [ "$i" -eq 5 ]; then exit 1; fi; \
		done

FROM maven:3.9.9-eclipse-temurin-17 AS runtime

WORKDIR /app

COPY --from=builder /app/target/*.jar /app/app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "/app/app.jar"]