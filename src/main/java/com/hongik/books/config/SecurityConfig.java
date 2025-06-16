package com.hongik.books.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    // JWT 디코더 설정 - JwtTokenProvider와 같은 비밀키 사용
    @Bean
    public JwtDecoder jwtDecoder(@Value("${jwt.secret}") String secret) {
        // JwtTokenProvider와 동일한 방식으로 키 생성
        SecretKey key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    // JWT 인증 변환기 - JWT 클레임을 Authentication 객체로 변환
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        // JWT에서 권한 정보 추출하는 방법 설정
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // roles 클레임에서 권한 정보 추출
            Object rolesClaim = jwt.getClaim("roles");
            List<String> roles;

            if (rolesClaim instanceof List) {
                roles = ((List<?>) rolesClaim).stream()
                        .map(Object::toString)
                        .collect(Collectors.toList());
            } else if (rolesClaim instanceof String) {
                roles = List.of((String) rolesClaim);
            } else {
                roles = List.of("USER"); // 기본 권한
            }

            return roles.stream()
                    .map(role -> role.startsWith("ROLE_") ?
                            new SimpleGrantedAuthority(role) :
                            new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList());
        });

        // JWT subject를 principal name으로 설정
        converter.setPrincipalClaimName("sub");

        return converter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtDecoder jwtDecoder,
                                           JwtAuthenticationConverter jwtAuthenticationConverter) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/users/signup",
                                "/api/users/login",
                                "/api/users/id-check",
                                "/api/users/email-check",
                                "/error",
                                "/actuator/health"
                        ).permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                // OAuth2 Resource Server로 JWT 처리
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter)))
                .build();
    }

    // 개발/테스트용 사용자
    @Bean
    public UserDetailsService testUsers(PasswordEncoder enc) {
        UserDetails admin = User.withUsername("admin")
                .password(enc.encode("1234"))
                .roles("ADMIN")
                .build();

        UserDetails user = User.withUsername("user")
                .password(enc.encode("1234"))
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(admin, user);
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