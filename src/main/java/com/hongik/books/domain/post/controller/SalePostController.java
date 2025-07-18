package com.hongik.books.domain.post.controller;

import com.hongik.books.domain.post.dto.SalePostCreateRequestDTO;
import com.hongik.books.domain.post.dto.SalePostDetailResponseDTO;
import com.hongik.books.domain.post.dto.SalePostSummaryResponseDTO;
import com.hongik.books.domain.post.dto.SalePostUpdateRequestDTO;
import com.hongik.books.domain.post.service.SalePostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
        // 지금은 테스트를 위해 임시로 1L을 사용
        Long sellerId = 1L;

        Long postId = salePostService.createSalePost(request, image, sellerId);
        return ResponseEntity.created(URI.create("/api/posts/" + postId)).build();
    }

    /**
     * 특정 판매 게시글의 상세 정보를 조회하는 API
     * [GET] /api/posts/{postId}
     * @param postId URL 경로에 포함된 게시글 ID
     */
    @GetMapping("/{postId}")
    public ResponseEntity<SalePostDetailResponseDTO> getSalePost(@PathVariable Long postId) {
        SalePostDetailResponseDTO response = salePostService.getSalePostById(postId);
        return ResponseEntity.ok(response);
    }

    /**
     * 판매 게시글 목록을 페이지네이션하여 조회하는 API
     * [GET] /api/posts?page=0&size=10&sort=createdAt,desc
     */
    @GetMapping
    public ResponseEntity<Page<SalePostSummaryResponseDTO>> getSalePosts(
            // @PageableDefault: 기본 페이지 크기, 정렬 기준 등을 설정
            @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {

        Page<SalePostSummaryResponseDTO> posts = salePostService.getSalePosts(pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * 특정 판매 게시글을 수정하는 API
     * [PATCH] /api/posts/{postId}
     */
    @PatchMapping("/{postId}")
    public ResponseEntity<Void> updateSalePost(
            @PathVariable Long postId,
            @RequestBody SalePostUpdateRequestDTO request) {

        // TODO: 로그인 기능 구현 후, SecurityContext에서 실제 사용자 ID를 가져와야 합니다.
        Long userId = 1L;

        salePostService.updateSalePost(postId, request, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 특정 판매 게시글을 삭제하는 API
     * [DELETE] /api/posts/{postId}
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deleteSalePost(@PathVariable Long postId) {

        // TODO: 로그인 기능 구현 후, SecurityContext에서 실제 사용자 ID를 가져와야 합니다.
        Long userId = 1L;

        salePostService.deleteSalePost(postId, userId);
        return ResponseEntity.noContent().build(); // 내용 없이 성공(204 No Content) 응답
    }
}
