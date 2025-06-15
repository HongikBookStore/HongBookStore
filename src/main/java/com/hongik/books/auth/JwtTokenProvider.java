package com.hongik.books.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;


/**
 * JWT 토큰 생성 및 검증을 담당하는 컴포넌트
 * - HS256 대칭키로 JWT 발급
 * - 토큰 유효성 검증 및 사용자 정보 추출
 */
@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long validityMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expire-min}") long minutes) {

        // 비밀키 길이 검증 (HS256은 최소 256비트/32바이트 필요)
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 characters long for HS256");
        }

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.validityMs = minutes * 60_000;

        if (this.validityMs <= 0) {
            throw new IllegalArgumentException("JWT expiration time must be positive");
        }
    }

    /**
     * Access Token 생성
     * @param userId 사용자 ID
     * @return JWT 토큰 문자열
     */
    public String createTokenWithRoles(Long userId, List<String> roles) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (roles == null) {
            roles = List.of("USER"); // 기본 역할
        }

        Date now = new Date();
        Date expiration = new Date(now.getTime() + validityMs);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(this.key)
                .compact();
    }

    /**
     * 토큰에서 사용자 ID 추출
     * @param token JWT 토큰
     * @return 사용자 ID
     * @throws JwtException 토큰이 유효하지 않은 경우
     */
    public Long getUserId(String token) {
        if (!StringUtils.hasText(token)) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token).getPayload();

            String subject = claims.getSubject();
            if (subject == null) {
                throw new JwtException("Token subject is null");
            }

            return Long.valueOf(subject);
        } catch (NumberFormatException e) {
            throw new JwtException("Invalid user ID format in token", e);
        } catch (ExpiredJwtException e) {
            throw new JwtException("Token has expired", e);
        } catch (JwtException e) {
            throw new JwtException("Invalid token", e);
        }
    }

    /**
     * 토큰 유효성 검증
     * @param token JWT 토큰
     * @return 유효한 토큰인지 여부
     */
    public boolean validateToken(String token) {
        if (!StringUtils.hasText(token)) {
            return false;
        }

        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * 토큰에서 Claims 추출 (추가 정보가 필요한 경우)
     * @param token JWT 토큰
     * @return Claims 객체
     */
    public Claims getClaims(String token) {
        if (!StringUtils.hasText(token)) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }

        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            throw new JwtException("Failed to extract claims from token", e);
        }
    }

    /**
     * 토큰 만료 시간 확인
     * @param token JWT 토큰
     * @return 만료 시간
     */
    public Date getExpirationDate(String token) {
        return getClaims(token).getExpiration();
    }

    /**
     * 토큰이 만료되었는지 확인
     * @param token JWT 토큰
     * @return 만료 여부
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDate(token);
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true; // 파싱 실패시 만료된 것으로 간주
        }
    }
}