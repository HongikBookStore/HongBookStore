package com.hongik.books.security.oauth.handler;

import com.hongik.books.auth.jwt.JwtTokenProvider;

import com.hongik.books.security.oauth.CustomOAuth2User;
import com.hongik.books.domain.user.domain.CustomUserDetails;
import com.hongik.books.domain.user.domain.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // 소셜 로그인 결과로 새로운 인증 객체 생성
        Authentication newAuth = getNewAuth(authentication);

        // 새로운 인증 객체를 사용하여 토큰을 생성
        String accessToken = jwtTokenProvider.createAccessToken(newAuth);
        String refreshToken = jwtTokenProvider.createRefreshToken(newAuth);
        log.info("로그인 성공. JWT Access Token 발급: {}, {}", accessToken,  refreshToken);


        // 프론트엔드로 리다이렉트할 URL
        // Token은 쿼리 파라미터로 전달
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth/callback") // 프론트엔드의 콜백 주소
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        // 생성된 URL로 리다이렉트
        // clearAuthenticationAttributes(request); // 로그인 과정에서 생성된 임시 세션 정보를 삭제
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private static Authentication getNewAuth(Authentication authentication) {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();

        // 우리 서비스의 User 엔티티 정보를 꺼냅니다.
        User user = oAuth2User.getUser();

        // JwtTokenProvider가 이해할 수 있는 CustomUserDetails을 만듭니다.
        CustomUserDetails userDetails = new CustomUserDetails(user);

        // 새로운 인증(Authentication) 객체를 생성
        // 이제 이 인증 객체의 Principal은 CustomUserDetails 타입
        return new UsernamePasswordAuthenticationToken(
                userDetails,
                null, // 소셜 로그인이므로 비밀번호는 필요 x
                userDetails.getAuthorities()
        );
    }
}
