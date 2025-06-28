package com.hongik.books.user.controller;

import com.hongik.books.user.dto.ApiResponse;
import com.hongik.books.user.dto.LoginResponseDTO;
import com.hongik.books.user.service.AuthService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@RequestBody AuthRequest authRequest) {
        try {
            // Service에서 로그인 처리 및 토큰 정보 반환
            ApiResponse<LoginResponseDTO> response = authService.login(authRequest.getUsername(), authRequest.getPassword());

            if (response.success()) {
                // 성공 시 헤더에 토큰 정보 추가
                HttpHeaders headers = new HttpHeaders();
                if (response.data() != null) {
                    headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + response.data().accessToken());
                    headers.add("Refresh-Token", response.data().refreshToken());
                }
                return ResponseEntity.ok().headers(headers).body(response);
            } else {
                // 실패 시 적절한 HTTP 상태 코드 반환
                HttpStatus status = determineHttpStatus(response.message());
                return ResponseEntity.status(status).body(response);
            }
        } catch (Exception e) {
            ApiResponse<LoginResponseDTO> errorResponse = new ApiResponse<>(
                    false,
                    "로그인 처리 중 오류가 발생했습니다.",
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // HTTP 상태 코드 결정 헬퍼 메서드
    private HttpStatus determineHttpStatus(String message) {
        if (message.contains("찾을 수 없습니다") || message.contains("존재하지 않습니다")) {
            return HttpStatus.NOT_FOUND;
        } else if (message.contains("인증되지 않았습니다") || message.contains("비밀번호가 올바르지 않습니다")) {
            return HttpStatus.UNAUTHORIZED;
        } else if (message.contains("잠겨있습니다") || message.contains("잠길 수 있습니다")) {
            return HttpStatus.LOCKED;
        } else {
            return HttpStatus.BAD_REQUEST;
        }
    }

    @DeleteMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(name = "Refresh-Token") String refreshToken) {
        boolean logoutSuccess = authService.logout(refreshToken);

        if (logoutSuccess) {
            ApiResponse<Void> response = new ApiResponse<>(true, "성공적으로 로그아웃했습니다.", null);
            return ResponseEntity.ok().body(response);
        } else {
            ApiResponse<Void> errorResponse = new ApiResponse<>(false, "잘못된 접근입니다.", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @Getter
    public static class AuthRequest {
        private String username;
        private String password;
    }
}
