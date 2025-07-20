package com.hongik.books.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PasswordResetConfirmDTO(
        @NotBlank(message = "유효한 토큰이 필요합니다.")
        String token,
        @NotBlank(message = "새 비밀번호를 입력해주세요.")
        @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$",
                message = "비밀번호는 영문 대소문자, 숫자, 특수문자를 포함하여 8 ~ 16자여야 합니다.")
        String newPassword
) {}
