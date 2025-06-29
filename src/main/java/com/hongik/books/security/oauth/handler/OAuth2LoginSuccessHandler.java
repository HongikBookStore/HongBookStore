package com.hongik.books.security.oauth.handler;

import com.hongik.books.jwt.JwtTokenProvider;

import com.hongik.books.security.oauth.CustomOAuth2User;
import com.hongik.books.user.domain.CustomUserDetails;
import com.hongik.books.user.domain.User;
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

        // 1. 소셜 로그인 결과로 받은 "방문객 출입증(CustomOAuth2User)"을 꺼냅니다.
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();

        // 2. 출입증에서 우리 서비스의 User 엔티티 정보를 꺼냅니다.
        User user = oAuth2User.getUser();

        // 3. [가장 중요한 수정] JwtTokenProvider가 이해할 수 있는 "정식 사원증(CustomUserDetails)"을 만듭니다.
        CustomUserDetails userDetails = new CustomUserDetails(user);

        // 4. 새로 만든 "정식 사원증"을 기반으로 새로운 인증(Authentication) 객체를 생성합니다.
        //    이제 이 인증 객체의 Principal은 CustomUserDetails 타입입니다.
        Authentication newAuth = new UsernamePasswordAuthenticationToken(
                userDetails,
                null, // 소셜 로그인이므로 비밀번호는 필요 없습니다.
                userDetails.getAuthorities()
        );

        // 5. 이 새로운 인증 객체를 사용하여 토큰을 생성합니다.
        String accessToken = jwtTokenProvider.createAccessToken(newAuth);
        String refreshToken = jwtTokenProvider.createRefreshToken(newAuth);
        log.info("로그인 성공. JWT Access Token 발급: {}, {}", accessToken,  refreshToken);


        // 프론트엔드로 리다이렉트할 URL
        // Token은 쿼리 파라미터로 전달합니다.
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth/callback") // 프론트엔드의 콜백 주소
                .queryParam("accessToken", accessToken)
                // 만약 리프레시 토큰도 URL로 전달해야 한다면 아래 주석을 해제하세요.
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        // 생성된 URL로 리다이렉트
        // clearAuthenticationAttributes(request); // 로그인 과정에서 생성된 임시 세션 정보를 삭제할 수 있습니다.
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
