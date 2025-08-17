package com.hongik.books.domain.review.seller.dto;

public record SellerReviewSummaryDTO(
        java.math.BigDecimal averageScore, // 0.00 ~ 5.00
        long reviewCount
) {}
