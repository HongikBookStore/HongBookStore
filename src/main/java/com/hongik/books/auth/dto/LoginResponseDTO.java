package com.hongik.books.auth.dto;

public record LoginResponseDTO(
        String accessToken,
        String refreshToken) {
}
