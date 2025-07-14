package com.hongik.books.domain.post.controller;

import com.hongik.books.domain.post.dto.SalePostCreateRequestDTO;
import com.hongik.books.domain.post.dto.SalePostDetailResponseDTO;
import com.hongik.books.domain.post.service.SalePostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;

/**
 * 판매 게시글 관련 API 요청을 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class SalePostController {
    private final SalePostService salePostService;

    /**
     * 새 판매 게시글을 생성하는 API (이미지 포함)
     * [POST] /api/posts
     * @param request JSON 형식의 게시글 데이터
     * @param image 이미지 파일
     */
    @PostMapping
    public ResponseEntity<Void> createSalePost(
            @RequestPart("request") SalePostCreateRequestDTO request,
            @RequestPart("image") MultipartFile image) throws IOException {

        // TODO: 로그인 기능 구현 후, SecurityContext에서 실제 사용자 ID를 가져와야 합니다.
        // 지금은 테스트를 위해 임시로 1L을 사용합니다.
        Long sellerId = 1L;

        Long postId = salePostService.createSalePost(request, image, sellerId);
        return ResponseEntity.created(URI.create("/api/posts/" + postId)).build();
    }

    /**
     * 특정 판매 게시글의 상세 정보를 조회하는 API (새로 추가된 API)
     * [GET] /api/posts/{postId}
     * @param postId URL 경로에 포함된 게시글 ID
     */
    @GetMapping("/{postId}")
    public ResponseEntity<SalePostDetailResponseDTO> getSalePost(@PathVariable Long postId) {
        SalePostDetailResponseDTO response = salePostService.getSalePostById(postId);
        return ResponseEntity.ok(response);
    }
}
