package com.hongik.books.web;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class CsrfController {
    @GetMapping("/api/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        // 호출만 해도 CookieCsrfTokenRepository가 XSRF-TOKEN 쿠키를 세팅
        return Map.of("token", token.getToken());
    }
}
