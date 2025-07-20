package com.hongik.books.auth.controller;

import com.hongik.books.auth.dto.PasswordResetConfirmDTO;
import com.hongik.books.auth.dto.PasswordResetRequestDTO;
import com.hongik.books.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
public class PasswordResetController {
    private final PasswordResetService passwordResetService;

    /**
     * 비밀번호 재설정 이메일 발송 요청
     */
    @PostMapping("/reset-request")
    public ResponseEntity<String> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDTO requestDto) {
        passwordResetService.sendPasswordResetLink(requestDto.email());
        return ResponseEntity.ok("비밀번호 재설정 이메일이 발송되었습니다.");
    }

    /**
     * 토큰과 새 비밀번호로 재설정 확정
     */
    @PostMapping("/reset-confirm")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetConfirmDTO confirmDto) {
        boolean success = passwordResetService.resetPassword(confirmDto.token(), confirmDto.newPassword());

        if (success) {
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("유효하지 않거나 만료된 요청입니다.");
        }
    }
}
