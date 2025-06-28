package com.hongik.books.security.oauth.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hongik.books.user.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {
    private final ObjectMapper objectMapper; // JSON 변환을 위해 주입

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        // 실패 로그 기록
        log.error("소셜 로그인에 실패했습니다. 에러 메시지: {}", exception.getMessage());

        // HTTP Status 설정
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // ApiResponse DTO 생성
        ApiResponse<Object> apiResponse = new ApiResponse<>(false, "로그인에 실패했습니다.", null);

        // ObjectMapper를 사용하여 JSON으로 변환 후 응답
        String result = objectMapper.writeValueAsString(apiResponse);
        response.getWriter().write(result);
    }
}
