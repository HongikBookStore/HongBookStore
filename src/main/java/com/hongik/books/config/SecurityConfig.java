package com.hongik.books.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filter(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)     // 개발 단계
                .cors(Customizer.withDefaults())
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(Customizer.withDefaults())      // 필요 시
                .authorizeHttpRequests(auth -> auth
                        // 회원가입·로그인 엔드포인트는 열어 두기
                        .requestMatchers(
                                "/api/**",
                                "/api/users/signup",
                                "/api/users/login",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/**"
                        ).permitAll()
                        // 그 밖의 /api/** 는 인증 필요
                        // .requestMatchers("/api/**").authenticated()
                        // 정적 리소스·루트 허용
                        .requestMatchers("/", "/favicon.ico", "/static/**").permitAll()
                        // 나머지 통째로 허용(운영에선 tighten)
                        .anyRequest().permitAll()
                );
        return http.build();
    }

    @Bean
    UserDetailsService testUsers(PasswordEncoder enc) {
        UserDetails u = User.withUsername("admin")
                .password(enc.encode("1234"))
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(u);
    }
}
