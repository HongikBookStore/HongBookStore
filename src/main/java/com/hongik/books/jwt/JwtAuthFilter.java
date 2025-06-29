package com.hongik.books.jwt;

import com.hongik.books.user.domain.CustomUserDetails;
import com.hongik.books.user.service.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// JWT 토큰을 사용해 인증을 처리하는 필터
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // JWT 토큰 추출
            String jwt = jwtTokenProvider.resolveToken(request);
            if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
                // [가장 중요한 추가!] 토큰이 로그아웃된 사용자의 것인지 확인합니다.
                if (jwtTokenProvider.isTokenIssuedBeforeLogout(jwt)) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "이미 로그아웃된 사용자입니다.");
                    return;
                }

                // 토큰에서 사용자 정보 추출
                String username = jwtTokenProvider.getUsername(jwt);

                // 사용자 정보로부터 UserDetails 로드
                CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);
                // 인증 객체 생성
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // SecurityContext에 인증 객체 설정
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (ExpiredJwtException e) {
            // 액세스 토큰 만료 시 리프레시 토큰으로 재발급 로직 (기존 로직 유지)
            // 이 부분은 지금 구조에서 크게 수정할 필요는 없습니다.
            // 다만, 리프레시 토큰 자체도 isTokenIssuedBeforeLogout 같은 검증이 필요할 수 있습니다.
            // handleTokenExpiration(request, response);
            // return;
            logger.warn("만료된 JWT 토큰입니다.", e);
        } catch (Exception e) {
            logger.error("JWT 필터에서 오류가 발생했습니다.", e);
            SecurityContextHolder.clearContext();
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }
}
