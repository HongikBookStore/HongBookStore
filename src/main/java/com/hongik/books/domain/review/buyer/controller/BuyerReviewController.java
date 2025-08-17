package com.hongik.books.domain.review.buyer.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.domain.review.buyer.dto.BuyerReviewCreateRequestDTO;
import com.hongik.books.domain.review.buyer.dto.BuyerReviewResponseDTO;
import com.hongik.books.domain.review.buyer.dto.BuyerReviewSummaryDTO;
import com.hongik.books.domain.review.buyer.service.BuyerReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/buyer-reviews")
@RequiredArgsConstructor
public class BuyerReviewController {
    private final BuyerReviewService buyerReviewService;

    // 후기 작성 (판매자 -> 구매자)
    @PostMapping
    public ResponseEntity<Void> createReview(@AuthenticationPrincipal LoginUserDTO loginUser,
                                             @Valid @RequestBody BuyerReviewCreateRequestDTO request) {
        buyerReviewService.createReview(loginUser.id(), request);
        return ResponseEntity.created(URI.create("/api/buyer-reviews")).build();
    }

    // 특정 구매자에 대한 후기 목록 (공개)
    @GetMapping("/buyers/{buyerId}")
    public ResponseEntity<List<BuyerReviewResponseDTO>> getBuyerReviews(@PathVariable Long buyerId) {
        return ResponseEntity.ok(buyerReviewService.getReviewsForBuyer(buyerId));
    }

    // 특정 구매자에 대한 평점 요약 (공개)
    @GetMapping("/buyers/{buyerId}/summary")
    public ResponseEntity<BuyerReviewSummaryDTO> getBuyerSummary(@PathVariable Long buyerId) {
        return ResponseEntity.ok(buyerReviewService.getBuyerSummary(buyerId));
    }

    // 내가 받은 후기 목록 (인증 필요)
    @GetMapping("/my-received")
    public ResponseEntity<List<BuyerReviewResponseDTO>> getMyReceived(@AuthenticationPrincipal LoginUserDTO loginUser) {
        return ResponseEntity.ok(buyerReviewService.getMyReceivedReviews(loginUser.id()));
    }
}

