package com.hongik.books.domain.user.dto;

public record UserResponseDTO(
        String username,
        String email,
        boolean studentVerified,
        String univEmail) {
}
