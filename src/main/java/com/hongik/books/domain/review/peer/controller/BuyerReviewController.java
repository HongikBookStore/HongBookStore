package com.hongik.books.domain.review.buyer.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.domain.review.peer.dto.PeerReviewDtos;
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
                                             @Valid @RequestBody PeerReviewDtos.CreateRequest request) {
        buyerReviewService.createReview(loginUser.id(), request);
        return ResponseEntity.created(URI.create("/api/buyer-reviews")).build();
    }

    // 특정 구매자에 대한 후기 목록 (공개)
    @GetMapping("/buyers/{buyerId}")
    public ResponseEntity<PeerReviewDtos.PageRes> getBuyerReviews(@PathVariable Long buyerId,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(buyerReviewService.getReviewsForBuyer(buyerId, page, size));
    }

    // 특정 구매자에 대한 평점 요약 (공개)
    @GetMapping("/buyers/{buyerId}/summary")
    public ResponseEntity<PeerReviewDtos.Summary> getBuyerSummary(@PathVariable Long buyerId) {
        return ResponseEntity.ok(buyerReviewService.getBuyerSummary(buyerId));
    }

    // 내가 받은 후기 목록 (인증 필요)
    @GetMapping("/my-received")
    public ResponseEntity<PeerReviewDtos.PageRes> getMyReceived(@AuthenticationPrincipal LoginUserDTO loginUser,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(buyerReviewService.getMyReceivedReviews(loginUser.id(), page, size));
    }
}
