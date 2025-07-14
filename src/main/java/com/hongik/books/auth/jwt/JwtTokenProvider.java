package com.hongik.books.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;


/**
 * JWT 토큰 생성 및 검증을 담당하는 컴포넌트
 * - HS256 대칭키로 JWT 발급
 * - 토큰 유효성 검증 및 사용자 정보 추출
 */
@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.token-validity-in-seconds}")
    private long accessTokenValiditySeconds;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenValiditySeconds;

    // 생성자에서 비밀키 초기화 - 의존성 주입
    public JwtTokenProvider(@Value("${jwt.secret}") String secret,
                            UserDetailsService userDetailsService) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.userDetailsService = userDetailsService;
    }

    // 주어진 Authentication 객체를 기반으로 Access JWT 토큰을 생성한다.
    public String createAccessToken(Authentication authentication) {
        return generateToken(authentication.getName(), accessTokenValiditySeconds * 1000L);
    }

    // 주어진 Authentication 객체를 기반으로 Refresh JWT 토큰을 생성한다.
    public String createRefreshToken(Authentication authentication) {
        return generateToken(authentication.getName(), refreshTokenValiditySeconds * 1000L);
    }

    // JWT 토큰의 유효성 검사
    // 유효한 토큰일 경우 true, 그렇지 않으면 false 리턴
    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            log.debug("토큰 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    // JWT 토큰에서 사용자 이름을 추출
    public String getUsernameFromToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("토큰이 null이거나 비어 있습니다.");
        }

        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (Exception e) {
            log.error("토큰에서 아이디 추출 실패: {}", e.getMessage());
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.", e);
        }
    }

    // PasswordResetService에서 필요로 하는 메서드 추가
    public long getExpiration(String token) {
        Date expirationDate = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
        long now = new Date().getTime();
        return expirationDate.getTime() - now;
    }

    // HttpServletRequest에서 Authorization 헤더에서 JWT 토큰을 추출
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7).trim(); // Bearer 토큰을 제외한 JWT 토큰 리턴
        }
        return null;
    }

    public Authentication getAuthentication(String token) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(this.getUsernameFromToken(token));
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    // 비밀번호 재설정용 토큰 생성 메서드 추가
    public String createPasswordResetToken(String username) {
        // 비밀번호 재설정 토큰 유효 시간 (예: 15분)
        long passwordResetTokenValidityInMilliseconds = 15 * 60 * 1000L;

        Date now = new Date();
        Date validity = new Date(now.getTime() + passwordResetTokenValidityInMilliseconds);

        return Jwts.builder()
                .subject(username)
                .claim("type", "password-reset")
                .issuedAt(now)
                .expiration(validity)
                .signWith(this.secretKey)
                .compact();
    }

    // ✨ 토큰 타입 검증 메서드 추가
    public boolean isPasswordResetToken(String token) {
        try {
            String tokenType = (String) Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("type");
            return "password-reset".equals(tokenType);
        } catch (Exception e) {
            return false;
        }
    }

    // JWT 토큰 생성
    private String generateToken(String username, long validityMilliseconds) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityMilliseconds);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(validity)
                .signWith(this.secretKey)
                .compact();
    }
}