package com.hongik.books.user.dto;

public record LoginResponseDTO(
        String accessToken,
        String refreshToken) {
}
