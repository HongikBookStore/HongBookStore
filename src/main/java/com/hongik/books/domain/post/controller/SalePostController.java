package com.hongik.books.domain.post.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.domain.post.dto.*;
import com.hongik.books.domain.post.service.SalePostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.List;

/**
 * 판매 게시글 관련 API 요청을 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class SalePostController {
    private final SalePostService salePostService;

    /**
     * [검색된 책]으로 새 판매 게시글을 생성하는 API
     * [POST] /api/posts
     * @AuthenticationPrincipal 어노테이션으로 로그인한 사용자 정보를 직접 받아옵니다.
     * @param request JSON 형식의 게시글 데이터
     */
    @PostMapping
    public ResponseEntity<Void> createSalePostFromSearch(
            @RequestBody SalePostCreateRequestDTO request,
            @AuthenticationPrincipal LoginUserDTO loginUser) {
        // 실제 로그인한 사용자의 ID를 서비스에 전달
        Long postId = salePostService.createSalePostFromSearch(request, loginUser.id());
        return ResponseEntity.created(URI.create("/api/posts/" + postId)).build();
    }

    /**
     * [직접 등록]으로 새 판매 게시글을 생성하는 API (이미지 포함)
     * [POST] /api/posts/custom
     */
    @PostMapping("/custom")
    public ResponseEntity<Void> createSalePostCustom(
            @RequestPart("request") SalePostCustomCreateRequestDTO request,
            @RequestPart("image") MultipartFile image,
            @AuthenticationPrincipal LoginUserDTO loginUser) throws IOException {
        Long postId = salePostService.createSalePostCustom(request, image, loginUser.id());
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
            @RequestBody SalePostUpdateRequestDTO request,
            @AuthenticationPrincipal LoginUserDTO loginUser) {

        salePostService.updateSalePost(postId, request, loginUser.id());
        return ResponseEntity.ok().build();
    }

    /**
     * 특정 판매 게시글을 삭제하는 API
     * [DELETE] /api/posts/{postId}
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deleteSalePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal LoginUserDTO loginUser) {

        salePostService.deleteSalePost(postId, loginUser.id());
        return ResponseEntity.noContent().build(); // 내용 없이 성공(204 No Content) 응답
    }

    /**
     * 내 판매글 목록을 조회하는 API
     * [GET] /api/my/posts
     */
    @GetMapping("/my")
    public ResponseEntity<List<MyPostSummaryResponseDTO>> getMySalePosts(@AuthenticationPrincipal LoginUserDTO loginUser) {
        List<MyPostSummaryResponseDTO> myPosts = salePostService.getMySalePosts(loginUser.id());
        return ResponseEntity.ok(myPosts);
    }

    /**
     * 판매 게시글의 상태를 변경하는 API
     * [PATCH] /api/posts/{postId}/status
     */
    @PatchMapping("/{postId}/status")
    public ResponseEntity<Void> updateSalePostStatus(
            @PathVariable Long postId,
            @RequestBody SalePostStatusUpdateRequestDTO request,
            @AuthenticationPrincipal LoginUserDTO loginUser) {
        salePostService.updateSalePostStatus(postId, request, loginUser.id());
        return ResponseEntity.ok().build();
    }
}
