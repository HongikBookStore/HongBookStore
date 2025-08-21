package com.hongik.books.domain.review.peer.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.domain.review.peer.dto.PeerReviewDtos;
import com.hongik.books.domain.review.peer.service.SellerReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/seller-reviews")
@RequiredArgsConstructor
public class SellerReviewController {
    private final SellerReviewService sellerReviewService;

    // 후기 작성 (구매자 -> 판매자)
    @PostMapping
    public ResponseEntity<Void> createReview(
            @AuthenticationPrincipal LoginUserDTO loginUser,
            @Valid @RequestBody PeerReviewDtos.CreateRequest request) {
        sellerReviewService.createReview(loginUser.id(), request);
        return ResponseEntity.created(URI.create("/api/seller-reviews"))
                .build();
    }

    // 특정 판매자에 대한 후기 목록 (공개)
    @GetMapping("/sellers/{sellerId}")
    public ResponseEntity<PeerReviewDtos.PageRes> getSellerReviews(@PathVariable Long sellerId,
                                                                  @RequestParam(defaultValue = "0") int page,
                                                                  @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(sellerReviewService.getReviewsForSeller(sellerId, page, size));
    }

    // 특정 판매자에 대한 평점 요약 (공개)
    @GetMapping("/sellers/{sellerId}/summary")
    public ResponseEntity<PeerReviewDtos.Summary> getSellerSummary(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerReviewService.getSellerSummary(sellerId));
    }

    // 내가 받은 후기 목록 (인증 필요)
    @GetMapping("/my-received")
    public ResponseEntity<PeerReviewDtos.PageRes> getMyReceived(@AuthenticationPrincipal LoginUserDTO loginUser,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(sellerReviewService.getMyReceivedReviews(loginUser.id(), page, size));
    }
}
