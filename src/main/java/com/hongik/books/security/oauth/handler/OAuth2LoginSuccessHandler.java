package com.hongik.books.security.oauth.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hongik.books.security.oauth.CustomOAuth2User;
import com.hongik.books.security.oauth.CustomOAuth2UserService;
import com.hongik.books.security.oauth.info.OAuth2UserInfo;
import com.hongik.books.security.oauth.info.OAuth2UserInfoFactory;
import com.hongik.books.jwt.JwtTokenProvider;
import com.hongik.books.user.domain.CustomUserDetails;
import com.hongik.books.user.domain.User;
import com.hongik.books.user.dto.ApiResponse;
import com.hongik.books.user.dto.LoginResponseDTO;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomOAuth2UserService oAuth2UserService;
    private final ObjectMapper objectMapper; // JSON 변환을 위해 주입

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        // CustomOAuth2User 객체를 생성
        CustomOAuth2User customOAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        String socialType = customOAuth2User.getSocialType();

        // OAuth2UserInfo를 사용하여 사용자 정보를 가져옴
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(socialType, customOAuth2User.getAttributes());
        User user = oAuth2UserService.getUserByOAuth2UserInfo(userInfo, socialType);
        CustomUserDetails userDetails = new CustomUserDetails(user);

        // CustomUserDetails를 Authentication으로 변환
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        // Access Token, Refresh Token 생성
        String accessToken = jwtTokenProvider.createAccessToken(auth);
        String refreshToken = jwtTokenProvider.createRefreshToken(auth);

        // 응답 데이터 생성
        LoginResponseDTO loginResponse = new LoginResponseDTO(accessToken, refreshToken);
        ApiResponse<LoginResponseDTO> apiResponse = new ApiResponse<>(true, "로그인 성공", loginResponse);

        // JSON 형식으로 응답 설정
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String result = objectMapper.writeValueAsString(apiResponse);
            response.getWriter().write(result);
        } catch (JsonProcessingException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\":false, \"message\":\"서버 내부 오류가 발생했습니다.\", \"data\":null}");
        }

    }
}
