package com.hongik.books.domain.review.seller.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.domain.review.seller.dto.SellerReviewCreateRequestDTO;
import com.hongik.books.domain.review.seller.dto.SellerReviewResponseDTO;
import com.hongik.books.domain.review.seller.dto.SellerReviewSummaryDTO;
import com.hongik.books.domain.review.seller.service.SellerReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/seller-reviews")
@RequiredArgsConstructor
public class SellerReviewController {
    private final SellerReviewService sellerReviewService;

    // 후기 작성 (구매자 -> 판매자)
    @PostMapping
    public ResponseEntity<Void> createReview(
            @AuthenticationPrincipal LoginUserDTO loginUser,
            @Valid @RequestBody SellerReviewCreateRequestDTO request) {
        sellerReviewService.createReview(loginUser.id(), request);
        return ResponseEntity.created(URI.create("/api/seller-reviews"))
                .build();
    }

    // 특정 판매자에 대한 후기 목록 (공개)
    @GetMapping("/sellers/{sellerId}")
    public ResponseEntity<List<SellerReviewResponseDTO>> getSellerReviews(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerReviewService.getReviewsForSeller(sellerId));
    }

    // 특정 판매자에 대한 평점 요약 (공개)
    @GetMapping("/sellers/{sellerId}/summary")
    public ResponseEntity<SellerReviewSummaryDTO> getSellerSummary(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerReviewService.getSellerSummary(sellerId));
    }

    // 내가 받은 후기 목록 (인증 필요)
    @GetMapping("/my-received")
    public ResponseEntity<List<SellerReviewResponseDTO>> getMyReceived(@AuthenticationPrincipal LoginUserDTO loginUser) {
        return ResponseEntity.ok(sellerReviewService.getMyReceivedReviews(loginUser.id()));
    }
}
