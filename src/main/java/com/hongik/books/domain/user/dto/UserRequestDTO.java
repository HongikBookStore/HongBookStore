package com.hongik.books.domain.user.dto;

import jakarta.validation.constraints.*;

/**
 * 사용자 프로필 정보 수정을 위한 DTO
 * 회원가입이 아닌, 정보 수정에 사용
 */
public record UserRequestDTO(
        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하로 입력해주세요.")
        String username, // '로그인 아이디'가 아닌 '닉네임'으로 사용

        String profileImagePath // 프로필 이미지 경로 업데이트를 위한 필드 (선택적)
        ) {
}
