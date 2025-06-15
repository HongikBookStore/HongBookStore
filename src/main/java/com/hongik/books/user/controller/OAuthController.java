package com.hongik.books.user.controller;

import com.hongik.books.user.dto.SignUpRequest;
import com.hongik.books.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
@RequestMapping("/oauth")
@RequiredArgsConstructor
public class OAuthController {
    private final UserService userService;

    @GetMapping("/loginSuccess")
    public String loginSuccess(@AuthenticationPrincipal(expression = "attributes") Map<String, Object> attr) {
        String email = (String) attr.get("email");
        String username = (String) attr.getOrDefault("login", email);
        userService.findByUsername(username).or(() -> {
            userService.signUp(new SignUpRequest(email, username, "social-login"));
            return userService.findByUsername(username);
        });
        return "redirect:/";
    }
}
