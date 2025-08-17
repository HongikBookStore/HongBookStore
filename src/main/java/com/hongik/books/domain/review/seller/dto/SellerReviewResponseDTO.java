package com.hongik.books.domain.review.seller.dto;

import com.hongik.books.domain.review.seller.domain.SellerReview;
import java.math.BigDecimal;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public record SellerReviewResponseDTO(
        Long reviewId,
        Long postId,
        Long reviewerId,
        String reviewerNickname,
        String ratingLabel,
        BigDecimal ratingScore,
        List<String> ratingKeywords,
        LocalDateTime createdAt
) {
    public static SellerReviewResponseDTO fromEntity(SellerReview r) {
        List<String> keywords = r.getRatingKeywords() == null || r.getRatingKeywords().isBlank()
                ? List.of()
                : Arrays.stream(r.getRatingKeywords().split(",")).map(String::trim).toList();
        return new SellerReviewResponseDTO(
                r.getId(),
                r.getSalePost().getId(),
                r.getReviewer().getId(),
                r.getReviewer().getUsername(),
                r.getRatingLabel(),
                r.getRatingScore() == null ? BigDecimal.ZERO : r.getRatingScore().setScale(2, java.math.RoundingMode.HALF_UP),
                keywords,
                r.getCreatedAt()
        );
    }
}
