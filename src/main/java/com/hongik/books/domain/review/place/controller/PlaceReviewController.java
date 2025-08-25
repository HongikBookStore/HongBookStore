package com.hongik.books.domain.review.place.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.domain.review.place.domain.ReviewReaction;
import com.hongik.books.domain.review.place.dto.ReviewDtos;
import com.hongik.books.domain.review.place.service.PlaceReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 장소별 리뷰 조회/작성 및 좋아요/싫어요 처리
 *  - GET    /api/places/{placeId}/reviews
 *  - POST   /api/places/{placeId}/reviews
 *  - POST   /api/places/reviews/{reviewId}/reactions?type=LIKE|DISLIKE
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places")
public class PlaceReviewController {

    private final PlaceReviewService service;

    @GetMapping("/{placeId}/reviews")
    public ResponseEntity<ReviewDtos.ListRes> list(
            @PathVariable Long placeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.listByPlace(placeId, page, size));
    }

    @PostMapping("/{placeId}/reviews")
    public ResponseEntity<java.util.Map<String, Object>> create(
            @PathVariable Long placeId,
            @AuthenticationPrincipal LoginUserDTO loginUser,
            @RequestBody ReviewDtos.CreateReq req
    ) {
        Long id = service.createReview(
                placeId,
                loginUser.id(),
                req.getRating(),
                req.getContent(),
                req.getPhotoUrls()
        );
        return ResponseEntity.ok(java.util.Map.of("id", id));
    }

    @PostMapping("/reviews/{reviewId}/reactions")
    public ResponseEntity<Void> react(
            @PathVariable Long reviewId,
            @RequestParam("type") ReviewReaction.ReactionType type,
            @AuthenticationPrincipal LoginUserDTO loginUser
    ) {
        service.react(reviewId, loginUser.id(), type);
        return ResponseEntity.ok().build();
    }
}
