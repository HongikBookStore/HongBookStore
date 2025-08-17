package com.hongik.books.domain.review.buyer.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record BuyerReviewCreateRequestDTO(
        @NotNull Long postId,
        @NotBlank String ratingLabel,
        @NotNull
        @DecimalMin(value = "0.00", inclusive = true)
        @DecimalMax(value = "5.00", inclusive = true)
        @Digits(integer = 1, fraction = 2)
        java.math.BigDecimal ratingScore,
        List<String> ratingKeywords
) {}

