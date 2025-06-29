package com.hongik.books.jwt;

import com.hongik.books.user.domain.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;


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
    private final StringRedisTemplate stringRedisTemplate;

    @Value("${jwt.token-validity-in-seconds}")
    private long accessTokenValiditySeconds;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenValiditySeconds;

    // 생성자에서 비밀키 초기화 - 의존성 주입
    public JwtTokenProvider(@Value("${jwt.secret}") String secret,
                            UserDetailsService userDetailsService,
                            StringRedisTemplate stringRedisTemplate) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.userDetailsService = userDetailsService;
        this.stringRedisTemplate = stringRedisTemplate;
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
            return !isTokenIssuedBeforeLogout(refreshToken);
        } catch (Exception e) {
            log.debug("리프레시 토큰 블랙리스트 확인 실패: {}", e.getMessage());
            return false;
        }
    }

    // JWT 토큰에서 사용자 이름을 추출
    public String getUsername(String token) {
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
            log.error("토큰에서 아이디 추출 실패: {}", e.getMessage());
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


    /**
     * [새로운 전략] 사용자의 최종 로그아웃 시간을 Redis에 기록합니다.
     * @param refreshToken 로그아웃 요청에 사용된 리프레시 토큰
     * @return 성공적으로 기록되면 true
     */
    public boolean recordLogoutTime(String refreshToken) {
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return false;
        }
        try {
            String username = getUsername(refreshToken);
            // "logout:{username}" 이라는 키로 현재 시간을 저장합니다.
            // 리프레시 토큰의 유효기간만큼만 이 기록을 유지합니다.
            stringRedisTemplate.opsForValue().set(
                    "logout:" + username,
                    String.valueOf(System.currentTimeMillis()),
                    refreshTokenValiditySeconds,
                    TimeUnit.SECONDS
            );
            log.info("{} 사용자가 로그아웃을 요청했습니다. 최종 로그아웃 시간을 기록합니다.", username);
            return true;
        } catch (Exception e) {
            log.error("로그아웃 시간 기록 중 오류 발생", e);
            return false;
        }
    }


    /**
     * [새로운 전략] 토큰이 최종 로그아웃 시간 이전에 발급되었는지 확인합니다.
     * @param accessToken 검증할 액세스 토큰
     * @return 로그아웃 이전에 발급된 토큰이면 true, 아니면 false
     */
    public boolean isTokenIssuedBeforeLogout(String accessToken) {
        try {
            Claims claims = Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(accessToken).getPayload();
            String username = claims.getSubject();
            Date issuedAt = claims.getIssuedAt();

            String logoutTimestampStr = stringRedisTemplate.opsForValue().get("logout:" + username);
            if (logoutTimestampStr == null) {
                return false; // 로그아웃 기록이 없으면 유효함
            }

            long logoutTimestamp = Long.parseLong(logoutTimestampStr);
            // 토큰 발급시간이 로그아웃 시간보다 이전이면, 이 토큰은 무효합니다.
            return issuedAt.getTime() < logoutTimestamp;
        } catch (Exception e) {
            log.debug("로그아웃 시간 확인 중 오류 발생", e);
            // 확인 중 오류가 발생하면 안전하게 무효 처리합니다.
            return true;
        }
    }

    // Refresh 토큰을 사용하여 새로운 Access 토큰 생성
    public String createTokenFromRefreshToken(String refreshToken) {
        if (!validateRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        try {
            String username = getUsername(refreshToken);
            CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);

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