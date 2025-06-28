package com.hongik.books.user.service;

import com.hongik.books.jwt.JwtTokenProvider;
import com.hongik.books.user.dto.ApiResponse;
import com.hongik.books.user.dto.LoginResponseDTO;
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

    // Refresh 토큰을 블랙리스트에 추가하고, 성공적으로 추가되면 true를 반환한다.
    public boolean logout(String token) {
        return jwtTokenProvider.blacklistRefreshToken(token);
    }
}
