package com.hongik.books.config;



import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

@Configuration
public class GcpStorageConfig {
    @Value("${spring.cloud.gcp.project-id}")
    private String projectId;

    @Value("${spring.cloud.gcp.credentials.location}")
    private String keyFilePath;

    @Bean
    public Storage storage() throws IOException {
        // 1. keyFilePath (e.g., "classpath:gcp-service-account-key.json")에서 인증 키 파일을 읽어옵니다.
        ClassPathResource resource = new ClassPathResource(keyFilePath.replace("classpath:", ""));

        // 2. 키 파일을 통해 Google 서비스에 인증할 수 있는 GoogleCredentials 객체를 생성합니다.
        GoogleCredentials credentials = GoogleCredentials.fromStream(resource.getInputStream());

        // 3. 프로젝트 ID와 인증 정보를 사용하여 Storage 객체를 직접 생성하고, Spring 컨테이너에 Bean으로 등록합니다.
        return StorageOptions.newBuilder()
                .setProjectId(projectId)
                .setCredentials(credentials)
                .build()
                .getService();
    }
}
