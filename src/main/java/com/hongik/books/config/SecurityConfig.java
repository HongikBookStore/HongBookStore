package com.hongik.books.config;

import com.hongik.books.auth.jwt.JwtAuthFilter;
import com.hongik.books.security.oauth.CustomOAuth2UserService;
import com.hongik.books.security.oauth.handler.OAuth2LoginFailureHandler;
import com.hongik.books.security.oauth.handler.OAuth2LoginSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;


@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://localhost:5175}")
    private String allowedOriginsCsv;

    @Bean // 필터 체인 구성
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // REST API에서는 불필요한 CSRF 보안 비활성화
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                // JWT 토큰 인증 시스템을 사용할 것이기에 서버가 세션을 생성하지 않도록
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // HTTP 요청에 대한 인가 규칙 설정
                .authorizeHttpRequests(auth -> auth
                        // --- 누구나 접근 가능한 API ---
                        .requestMatchers(
                                "/api/places/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/ws-stomp/**",
                                "/api/naver/**",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/api/directions/**",
                                "/api/notifications/stream", // 👈 추가
                                "/", "/login", "/oauth2/**", "/error"
                        ).permitAll()
                        // 인증 관련 API는 모두 허용
                        .requestMatchers("/api/auth/**").permitAll()
                        // 학생 인증 확인 링크는 허용
                        .requestMatchers("/api/users/verify-student/confirm").permitAll()
                        // 게시글 조회(GET)와 책 검색 API는 모두 허용
                        .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/**").permitAll()
                        // (통합으로 대체) 기존 seller/buyer-reviews 공개 경로 제거
                        // 통합 Peer 리뷰 조회(공개)
                        .requestMatchers(HttpMethod.GET, "/api/peer-reviews/users/**").permitAll()
                        // 통합 요약(공개)
                        .requestMatchers(HttpMethod.GET, "/api/reviews/summary/users/**").permitAll()
                        .requestMatchers("/api/search/**").permitAll()

                        // --- 로그인이 필요한 API ---
                        // '나의' 정보와 관련된 모든 API는 인증 필요
                        .requestMatchers("/api/my/**").authenticated()
                        // 게시글 생성, 수정, 삭제, 찜하기 등은 인증 필요
                        .requestMatchers("/api/posts/**").authenticated()
                        .requestMatchers("/api/places/*/reviews", "/api/places/reviews/**").authenticated()
                        .requestMatchers("/api/peer-reviews/my-received").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/peer-reviews").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/reviews/images").authenticated()
                        // 판매자/구매자 후기 작성/내가 받은 후기는 인증 필요
                        // (통합으로 대체) 기존 seller/buyer-reviews 인증 경로 제거

                        .requestMatchers(HttpMethod.POST, "/api/reviews/images").authenticated()
                        .requestMatchers("/api/user-categories/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/wanted/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/wanted/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/wanted/**").authenticated()

                        .requestMatchers(HttpMethod.POST,   "/api/reports/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/reports/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/api/reports/**").hasRole("ADMIN")

                        // 그 외 요청은 인증 필요
                        .anyRequest().authenticated())
                // OAuth 로그인 설정
                .oauth2Login(o -> o
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                        .userInfoEndpoint(u -> u
                                .userService(customOAuth2UserService))
                        .loginPage("/login") // 프론트엔드의 소셜 로그인 버튼이 있는 페이지
                )
                // JWT 인증 필터 추가
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // CORS 전역 설정 Bean
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        // 패턴 지원(Wildcard 도메인 포함). Credentials 사용 시 AllowedOrigins가 '*'이면 안 되므로 패턴 사용.
        cfg.setAllowedOriginPatterns(origins);
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
