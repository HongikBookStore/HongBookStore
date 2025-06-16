package com.hongik.books.user.controller;

import com.hongik.books.user.dto.ApiResponse;
import com.hongik.books.user.dto.SignUpRequest;
import com.hongik.books.user.repository.UserRepository;
import com.hongik.books.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Long>> signUp(@RequestBody @Valid SignUpRequest req) {
        ApiResponse<Long> res = userService.signUp(req);
        return res.success() ? ResponseEntity.ok(res) : ResponseEntity.badRequest().body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@RequestParam String username,
                                                     @RequestParam String password) {
        var res = userService.loginAndIssueToken(username,password);
        return res.success() ? ResponseEntity.ok(res) : ResponseEntity.status(401).body(res);
    }

    @GetMapping("/id-check")
    public Map<String,Boolean> idCheck(@RequestParam String username) {
        boolean available = !userRepository.existsByUsername(username);
        return Map.of("available", available);
    }

    @GetMapping("/email-check")
    public Map<String,Boolean> emailCheck(@RequestParam String email) {
        boolean available = !userRepository.existsByEmail(email);
        return Map.of("available", available);
    }

    @GetMapping("/find-id")
    public ApiResponse<String> findId(@RequestParam String email){
        return userService.findUsernameByEmail(email);
    }

}
