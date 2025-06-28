package com.hongik.books.security;

import com.hongik.books.jwt.JwtAuthFilter;
import com.hongik.books.security.oauth.CustomOAuth2UserService;
import com.hongik.books.security.oauth.handler.OAuth2LoginFailureHandler;
import com.hongik.books.security.oauth.handler.OAuth2LoginSuccessHandler;
import com.hongik.books.jwt.JwtTokenProvider;
import com.hongik.books.user.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractAuthenticationFilterConfigurer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final CustomUserDetailsService uds;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final JwtTokenProvider jwt;
    private final CustomOAuth2UserService customOAuth2UserService;

    /** 모든 서비스·컨트롤러에서 주입해 쓰는 PasswordEncoder */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean // AuthenticationManager 빈을 생성 (인증 요청 처리)
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean // 필터 체인 구성
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // REST API에서는 불필요한 CSRF 보안 비활성화
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                // JWT 토큰 인증 시스템을 사용할 것이기에 서버가 세션을 생성하지 않도록 한다.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // HTTP 요청에 대한 인가 규칙 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/users/signup",
                                "/api/users/login",
                                "/api/users/id-check",
                                "/api/users/email-check",
                                "/api/users/find-id",
                                "/api/users/verify/**",
                                "/actuator/health",
                                "/api/auth/login/",
                                "/api/auth/reissue",
                                "/api/auth/logout",
                                "api/auth/login/oauth2/**"
                        ).permitAll()
                        .anyRequest().authenticated()) // 그 외 요청은 인증 필요
                .formLogin(AbstractAuthenticationFilterConfigurer::permitAll) // 폼 로그인 페이지는 누구나 접근 가능
                // OAuth 로그인 설정
                .oauth2Login(o -> o
                        .loginPage("/api/auth/login")
                        .failureHandler(oAuth2LoginFailureHandler)
                        .successHandler(oAuth2LoginSuccessHandler)
                        .userInfoEndpoint(u -> u
                                .userService(customOAuth2UserService)
                        )
                )
                // JWT 인증 필터 추가
                .addFilterBefore(new JwtAuthFilter(jwt, uds), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // CORS 전역 설정 Bean
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("http://localhost:5173")); // dev
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}