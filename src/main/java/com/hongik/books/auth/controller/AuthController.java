package com.hongik.books.auth.controller;

import com.hongik.books.common.exception.dto.ApiResponse;
import com.hongik.books.auth.dto.LoginResponseDTO;
import com.hongik.books.auth.service.AuthService;
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
    /**
     * 로그아웃을 처리합니다.
     * @param authorizationHeader "Authorization" 헤더 (Bearer 토큰 포함)
     * @return 성공 응답
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {
        // 1. "Bearer " 접두사 제거하여 순수 액세스 토큰 추출
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "잘못된 토큰 형식입니다.", null));
        }
        String accessToken = authorizationHeader.substring(7);

        // 2. AuthService의 logout 메서드 호출
        authService.logout(accessToken);

        // 3. 성공 응답 반환
        ApiResponse<Void> response = new ApiResponse<>(true, "성공적으로 로그아웃되었습니다.", null);
        return ResponseEntity.ok(response);
    }

    @Getter
    public static class AuthRequest {
        private String username;
        private String password;
    }
}
