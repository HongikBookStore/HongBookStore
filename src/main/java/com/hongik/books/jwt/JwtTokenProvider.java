package com.hongik.books.jwt;

import com.hongik.books.user.domain.CustomUserDetails;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;


/**
 * JWT 토큰 생성 및 검증을 담당하는 컴포넌트
 * - HS256 대칭키로 JWT 발급
 * - 토큰 유효성 검증 및 사용자 정보 추출
 */
@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final JwtTokenRedisRepository jwtTokenRedisRepository;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.token-validity-in-seconds}")
    private long accessTokenValiditySeconds;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenValiditySeconds;

    // 생성자에서 비밀키 초기화 - 의존성 주입
    public JwtTokenProvider(@Value("${jwt.secret}") String secret,
                            JwtTokenRedisRepository jwtTokenRedisRepository,
                            UserDetailsService userDetailsService) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.jwtTokenRedisRepository = jwtTokenRedisRepository;
        this.userDetailsService = userDetailsService;
    }

    // 주어진 Authentication 객체를 기반으로 Access JWT 토큰을 생성한다.
    public String createAccessToken(Authentication authentication) {
        return generateToken(authentication, accessTokenValiditySeconds);
    }

    // 주어진 Authentication 객체를 기반으로 Refresh JWT 토큰을 생성한다.
    public String createRefreshToken(Authentication authentication) {
        return generateToken(authentication, refreshTokenValiditySeconds);
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

    // 리프레시 토큰 검증 (블랙리스트 체크 포함)
    public boolean validateRefreshToken(String refreshToken) {
        if (!validateToken(refreshToken)) {
            return false;
        }

        try {
            // 블랙리스트에 있는지 확인
            return !isRefreshTokenBlacklisted(refreshToken);
        } catch (Exception e) {
            log.debug("리프레시 토큰 블랙리스트 확인 실패: {}", e.getMessage());
            return false;
        }
    }

    // JWT 토큰에서 사용자 이름을 추출
    public String getEmail(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("토큰이 null이거나 비어있습니다.");
        }

        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (Exception e) {
            log.error("토큰에서 이메일 추출 실패: {}", e.getMessage());
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.", e);
        }
    }

    // HttpServletRequest에서 Authorization 헤더에서 JWT 토큰을 추출
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7).trim(); // Bearer 토큰을 제외한 JWT 토큰 리턴
        }
        return null;
    }

    // HttpServletRequest에서 Refresh 토큰을 추출
    public String resolveRefreshToken(HttpServletRequest request) {
        String refreshToken = request.getHeader("Refresh-Token");
        if (refreshToken != null && !refreshToken.trim().isEmpty()) {
            return refreshToken.trim();
        }
        return null;
    }


    // Refresh 토큰을 블랙리스트에 추가하고, 성공적으로 추가되면 true를 반환한다.
    public boolean blacklistRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            log.warn("블랙리스트에 추가할 토큰이 null이거나 비어있습니다.");
            return false;
        }

        try {
            String tokenId = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload()
                    .getId();

            if (tokenId == null || tokenId.trim().isEmpty()) {
                log.error("토큰에 jti 클레임이 포함되어 있지 않습니다.");
                return false;
            }

            boolean result = jwtTokenRedisRepository.addTokenToBlacklist(tokenId, refreshTokenValiditySeconds);
            if (result) {
                log.info("리프레시 토큰이 블랙리스트에 추가되었습니다. tokenId: {}", tokenId);
            }
            return result;
        } catch (Exception e) {
            log.error("리프레시 토큰 블랙리스트 추가 실패: {}", e.getMessage());
            return false;
        }
    }


    // 블랙리스트에 있는지 확인 (Refresh Token)
    public boolean isRefreshTokenBlacklisted(String refreshToken) {
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return true; // null이나 빈 토큰은 블랙리스트로 간주
        }

        try {
            String tokenId = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload()
                    .getId();

            if (tokenId == null || tokenId.trim().isEmpty()) {
                return true; // jti가 없는 토큰은 블랙리스트로 간주
            }

            return jwtTokenRedisRepository.isTokenBlacklisted(tokenId);
        } catch (Exception e) {
            log.debug("블랙리스트 확인 중 오류 발생: {}", e.getMessage());
            return true; // 오류가 발생한 토큰은 블랙리스트로 간주
        }
    }

    // Refresh 토큰을 사용하여 새로운 Access 토큰 생성
    public String createTokenFromRefreshToken(String refreshToken) {
        if (!validateRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        try {
            String email = getEmail(refreshToken);
            CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(email);

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    "",
                    userDetails.getAuthorities()
            );

            return generateToken(authentication, accessTokenValiditySeconds);
        } catch (Exception e) {
            log.error("리프레시 토큰으로부터 액세스 토큰 생성 실패: {}", e.getMessage());
            throw new IllegalArgumentException("토큰 생성에 실패했습니다.", e);
        }
    }

    // JWT 토큰 생성
    private String generateToken(Authentication authentication, long validitySeconds) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(validitySeconds);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(this.secretKey)
                .compact();
    }
}