package com.hongik.books.domain.review.buyer.dto;

public record BuyerReviewSummaryDTO(
        java.math.BigDecimal averageScore,
        long reviewCount
) {}

