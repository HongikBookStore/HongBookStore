package com.hongik.books.auth.service;

import com.hongik.books.auth.jwt.JwtTokenProvider;
import com.hongik.books.auth.jwt.JwtTokenRedisRepository;
import com.hongik.books.common.exception.dto.ApiResponse;
import com.hongik.books.auth.dto.LoginResponseDTO;
import com.hongik.books.domain.user.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenRedisRepository jwtTokenRedisRepository;

    public ApiResponse<LoginResponseDTO> login(String username, String password) {
        try {
            // 인증 수행
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));
            userDetailsService.processSuccessfulLogin(username);

            // 토큰 생성
            String accessToken = jwtTokenProvider.createAccessToken(authentication);
            String refreshToken = jwtTokenProvider.createRefreshToken(authentication);

            // 응답 데이터 생성
            LoginResponseDTO loginResponse = new LoginResponseDTO(accessToken, refreshToken);

            return new ApiResponse<>(true, "로그인이 성공적으로 완료되었습니다.", loginResponse);
        } catch (AuthenticationException e) {
            // 로그인 실패 처리
            userDetailsService.handleAccountStatus(username);
            userDetailsService.processFailedLogin(username);

            // 남은 로그인 시도 횟수 확인
            int remainingAttempts = userDetailsService.getRemainingLoginAttempts(username);
            String errorMessage = remainingAttempts > 0
                    ? String.format("로그인에 실패했습니다. 남은 시도 횟수: %d회", remainingAttempts)
                    : "계정이 잠겼습니다. 관리자에게 문의하세요.";

            return new ApiResponse<>(false, errorMessage, null);
        }
    }

    /**
     * 로그아웃을 처리합니다. 전달받은 액세스 토큰을 Redis 블랙리스트에 추가합니다.
     * @param accessToken 로그아웃할 사용자의 액세스 토큰
     */
    public void logout(String accessToken) {
        // 1. 토큰 유효성 검증
        if (!jwtTokenProvider.validateToken(accessToken)) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }

        // 2. 토큰의 남은 유효 시간을 계산
        long expiration = jwtTokenProvider.getExpiration(accessToken);

        // 3. Redis에 블랙리스트로 등록 (남은 유효 시간만큼만 저장하여 메모리 관리)
        jwtTokenRedisRepository.set(accessToken, "logout", expiration);
    }
}
