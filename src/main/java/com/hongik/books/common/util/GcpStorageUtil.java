package com.hongik.books.common.util;

import com.google.cloud.storage.BlobInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import com.google.cloud.storage.Storage;

import java.io.IOException;
import java.util.UUID;

/**
 * GCP Cloud Storage 관련 유틸리티 클래스
 */
@Component
@RequiredArgsConstructor
public class GcpStorageUtil {
    private final Storage storage; // GCP Storage에 대한 의존성 주입

    // application.yml의 spring.cloud.gcp.storage.bucket-name 값을 주입
    @Value("${spring.cloud.gcp.storage.bucket-name}")
    private String bucketName;

    /**
     * MultipartFile을 GCP Cloud Storage에 업로드하고, 공개 URL을 반환
     *
     * @param file 업로드할 이미지 파일
     * @param directory 업로드할 디렉토리 (e.g., "profile-images", "book-covers")
     * @return 업로드된 파일의 공개 URL
     * @throws IOException 파일 처리 중 예외 발생 시
     */
    public String uploadImage(MultipartFile file, String directory) throws IOException {
        // 1. 파일의 확장자를 포함한 고유한 파일 이름 생성 (UUID 사용)
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String uniqueFileName = UUID.randomUUID() + extension;
        String objectName = directory + "/" + uniqueFileName;

        // 2. BlobInfo 객체 생성 (파일 메타데이터)
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, objectName)
                .setContentType(file.getContentType())
                .build();

        // 3. GCP Storage에 파일 업로드
        storage.createFrom(blobInfo, file.getInputStream());

        // 4. 업로드된 파일의 공개 URL 반환
        return "https://storage.googleapis.com/" + bucketName + "/" + objectName;
    }
}
