package com.hongik.books.common.dto;

public record ModerationErrorDTO(
        String field,
        String predictionLevel,
        Double malicious,
        Double clean,
        String reason
) {}

