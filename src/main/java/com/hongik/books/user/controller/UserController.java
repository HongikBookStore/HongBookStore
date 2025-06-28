package com.hongik.books.user.controller;

import com.hongik.books.user.dto.ApiResponse;
import com.hongik.books.user.dto.UserResponseDTO;
import com.hongik.books.user.dto.UserRequestDTO;
import com.hongik.books.user.repository.UserRepository;
import com.hongik.books.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    // @Valid 어노테이션을 사용해 유효성 검사를 활성화, 통과한 경우 서비스 코드 호출
    public ResponseEntity<ApiResponse<UserResponseDTO>> signUp(@RequestBody @Valid UserRequestDTO request) {
        try {

            // 서비스 메서드 호출하여 회원가입 처리
            ApiResponse<Long> signUpResult = userService.signUp(request);

            if (signUpResult.success()) {
                // 회원가입 성공 시 UserResponse 생성
                UserResponseDTO userResponse = new UserResponseDTO(
                        request.username(),
                        request.email()
                );

                ApiResponse<UserResponseDTO> response = new ApiResponse<>(
                        true,
                        "회원 가입이 성공적으로 실행되었습니다. 이메일 인증을 완료해주세요.",
                        userResponse
                );

                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                // 회원가입 실패 시
                ApiResponse<UserResponseDTO> errorResponse = new ApiResponse<>(
                        false,
                        signUpResult.message(),
                        null
                );
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

        } catch (IllegalStateException e) {
            ApiResponse<UserResponseDTO> errorResponse = new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            ApiResponse<UserResponseDTO> errorResponse = new ApiResponse<>(
                    false,
                    "회원가입 중 오류가 발생했습니다.",
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 회원 정보 조회
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUser(@PathVariable Long userId) {
        ApiResponse<UserResponseDTO> response = userService.getUserById(userId);
        if (response.success()) {
            return ResponseEntity.ok().body(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // 회원 정보 수정
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateUser(@PathVariable Long userId,
                                                                   @Valid @RequestBody UserRequestDTO request) {
        try {
            ApiResponse<UserResponseDTO> response = userService.updateUser(userId, request);
            return ResponseEntity.ok().body(response);
        } catch (IllegalStateException e) {
            ApiResponse<UserResponseDTO> errorResponse = new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            ApiResponse<UserResponseDTO> errorResponse = new ApiResponse<>(
                    false,
                    "회원 정보 수정 중 오류가 발생했습니다.",
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 회원 삭제
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long userId) {
        ApiResponse<String> response = userService.deleteUser(userId);

        if (response.success()) {
            return ResponseEntity.ok().body(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // 이메일 인증
    @GetMapping("/verify/{token}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> verifyEmail(@PathVariable String token) {
        ApiResponse<UserResponseDTO> response = userService.verifyEmail(token);
        if (response.success()) {
            return ResponseEntity.ok().body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
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
