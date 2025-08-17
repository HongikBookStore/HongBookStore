package com.hongik.books.domain.review.seller.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public record SellerReviewCreateRequestDTO(
        @NotNull Long postId,
        @NotBlank String ratingLabel, // worst, bad, good, best
        @NotNull
        @DecimalMin(value = "0.00", inclusive = true)
        @DecimalMax(value = "5.00", inclusive = true)
        @Digits(integer = 1, fraction = 2)
        java.math.BigDecimal ratingScore,
        List<String> ratingKeywords
) {}
