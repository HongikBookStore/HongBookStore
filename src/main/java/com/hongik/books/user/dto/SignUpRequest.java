package com.hongik.books.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignUpRequest (
        @Email @NotBlank String email,
        @Size(min = 4, max = 20) @NotBlank String username,
        @Size(min = 8, message = "비밀번호는 최소 8자 이상입니다.") @NotBlank String password) {
}

