package com.hongik.books.common.controller;

import com.hongik.books.common.util.GcpStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 이미지 업로드 테스트를 위한 간단한 API 컨트롤러
 */
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageUploadController {
    private final GcpStorageUtil gcpStorageUtil;

    /**
     * 책 표지 이미지를 업로드하는 테스트 API
     * [POST] /api/images/book-cover
     */
    @PostMapping("/book-cover")
    public ResponseEntity<String> uploadBookCoverImage(@RequestParam("image") MultipartFile image) throws IOException {
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body("이미지 파일이 비어있습니다.");
        }
        String imageUrl = gcpStorageUtil.uploadImage(image, "book-covers");
        return ResponseEntity.ok(imageUrl);
    }
}
