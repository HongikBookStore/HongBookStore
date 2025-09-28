package com.hongik.books.config;

import com.hongik.books.auth.jwt.JwtAuthFilter;
import com.hongik.books.security.oauth.CustomOAuth2UserService;
import com.hongik.books.security.oauth.handler.OAuth2LoginFailureHandler;
import com.hongik.books.security.oauth.handler.OAuth2LoginSuccessHandler;
import com.hongik.books.security.oauth.repository.HttpCookieOAuth2AuthorizationRequestRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
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
    private final com.hongik.books.auth.filter.DeactivatedUserBlockFilter deactivatedUserBlockFilter;
    private final HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOriginsCsv;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // ✅ CSRF 쿠키 리포지토리 설정 (SameSite=None; Secure; Path=/, HttpOnly=false)
        CookieCsrfTokenRepository csrfRepo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepo.setCookiePath("/");
        csrfRepo.setSecure(true);
        // Spring Security 6.1+ 에서 지원. (하위버전이면 try-catch로 무시)
        try {
            csrfRepo.setCookieCustomizer(c -> c.sameSite("None"));
        } catch (Throwable ignored) {}

        // 요청에서 CSRF 토큰을 읽어오는 핸들러 (기본 헤더 X-XSRF-TOKEN 지원)
        CsrfTokenRequestAttributeHandler csrfReqHandler = new CsrfTokenRequestAttributeHandler();
        csrfReqHandler.setCsrfRequestAttributeName("_csrf");

        http
                // 🔄 CSRF 활성화 (기존 disable 제거)
                .csrf(csrf -> csrf
                                .csrfTokenRepository(csrfRepo)
                                .csrfTokenRequestHandler(csrfReqHandler)
                        // 굳이 검증을 끄고 싶은 경로가 있으면 아래에 추가:
                        // .ignoringRequestMatchers("/swagger-ui/**","/v3/api-docs/**","/ws-stomp/**","/actuator/**")
                )
                .cors(Customizer.withDefaults())
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/ws-stomp/**",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/api/directions/**",
                                "/api/notifications/stream",
                                "/", "/login", "/oauth2/**", "/error"
                        ).permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/users/verify-student/confirm").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/peer-reviews/users/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/summary/users/**").permitAll()
                        .requestMatchers("/api/search/**").permitAll()
                        // ⬇️ (선택) 프런트 초기화용 CSRF 프라임 엔드포인트 허용
                        .requestMatchers(HttpMethod.GET, "/api/csrf").permitAll()

                        .requestMatchers("/api/my/**").authenticated()
                        .requestMatchers("/api/posts/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers("/api/naver/**").permitAll()
                        .requestMatchers("/api/directions/**").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/places/search",
                                "/api/places/geocode",
                                "/api/places/geocode/forward",
                                "/api/places"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/places").hasAnyRole("STUDENT","ADMIN")
                        .requestMatchers(HttpMethod.GET,"/api/places/*/reviews", "/api/places/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.POST,"/api/places/*/reviews", "/api/places/reviews/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,"/api/places/*/reviews", "/api/places/reviews/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/places/*/reviews", "/api/places/reviews/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers("/api/peer-reviews/my-received").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/peer-reviews").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/reviews/images").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers("/api/user-categories/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/wanted/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/wanted/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/wanted/**").hasAnyRole("STUDENT", "ADMIN")

                        .requestMatchers(HttpMethod.POST,   "/api/reports/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/reports/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/api/reports/**").hasRole("ADMIN")

                        .anyRequest().authenticated())
                .oauth2Login(o -> o
                        .authorizationEndpoint(auth -> auth
                                .authorizationRequestRepository(authorizationRequestRepository))
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                        .userInfoEndpoint(u -> u
                                .userService(customOAuth2UserService))
                        .loginPage("/login")
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(deactivatedUserBlockFilter, UsernamePasswordAuthenticationFilter.class)
                // ✅ CsrfFilter 이후에 실행되도록 BasicAuthenticationFilter 뒤에 배치
                .addFilterAfter(new CsrfCookieForceFilter(), BasicAuthenticationFilter.class);

        return http.build();
    }

    // ✅ 매 요청마다 CSRF 토큰을 강제로 “접근”해서 쿠키 발급을 트리거
    static class CsrfCookieForceFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {
            CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (token == null) {
                token = (CsrfToken) request.getAttribute("_csrf"); // fallback
            }
            if (token != null) {
                // getToken()을 호출해야 CookieCsrfTokenRepository가 Set-Cookie를 내보냄
                token.getToken();
            }
            filterChain.doFilter(request, response);
        }
    }

    // CORS 전역 설정 Bean (기존 유지)
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "https://hong-book-store.vercel.app",
                "https://*.vercel.app"
        ));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Authorization","Location","Link"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
