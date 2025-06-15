package com.hongik.books.user.controller;

import com.hongik.books.user.dto.ApiResponse;
import com.hongik.books.user.dto.SignUpRequest;
import com.hongik.books.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {
    private final UserService userService;

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
}
