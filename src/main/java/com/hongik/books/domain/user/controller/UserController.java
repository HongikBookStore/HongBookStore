package com.hongik.books.domain.user.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.common.dto.ApiResponse;
import com.hongik.books.domain.user.dto.StudentVerificationRequestDTO;
import com.hongik.books.domain.user.dto.UserResponseDTO;
import com.hongik.books.domain.user.dto.UserRequestDTO;
import com.hongik.books.domain.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {
    private final UserService userService;
    // private final UserRepository userRepository;

//    @PostMapping("/signup")
//    // @Valid 어노테이션을 사용해 유효성 검사를 활성화, 통과한 경우 서비스 코드 호출
//    public ResponseEntity<ApiResponse<UserResponseDTO>> signUp(@RequestBody @Valid UserRequestDTO request) {
//        try {
//
//            // 서비스 메서드 호출하여 회원가입 처리
//            ApiResponse<Long> signUpResult = userService.signUp(request);
//
//            if (signUpResult.success()) {
//                // 회원가입 성공 시 UserResponse 생성
//                UserResponseDTO userResponse = new UserResponseDTO(
//                        request.username(),
//                        request.email()
//                );
//
//                ApiResponse<UserResponseDTO> response = new ApiResponse<>(
//                        true,
//                        "회원 가입이 성공적으로 실행되었습니다. 이메일 인증을 완료해주세요.",
//                        userResponse
//                );
//
//                return ResponseEntity.status(HttpStatus.CREATED).body(response);
//            } else {
//                // 회원가입 실패 시
//                ApiResponse<UserResponseDTO> errorResponse = new ApiResponse<>(
//                        false,
//                        signUpResult.message(),
//                        null
//                );
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
//            }
//
//        } catch (IllegalStateException e) {
//            ApiResponse<UserResponseDTO> errorResponse = new ApiResponse<>(
//                    false,
//                    e.getMessage(),
//                    null
//            );
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
//        } catch (Exception e) {
//            ApiResponse<UserResponseDTO> errorResponse = new ApiResponse<>(
//                    false,
//                    "회원가입 중 오류가 발생했습니다.",
//                    null
//            );
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//        }
//    }

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
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateUser(
            @PathVariable Long userId,
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

//    // 이메일 인증
//    @GetMapping("/verify/{token}")
//    public ResponseEntity<ApiResponse<UserResponseDTO>> verifyEmail(@PathVariable String token) {
//        ApiResponse<UserResponseDTO> response = userService.verifyEmail(token);
//        if (response.success()) {
//            return ResponseEntity.ok().body(response);
//        } else {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }

    /**
     * 현재 로그인한 사용자의 정보를 조회하는 API
     * @param loginUser JWT 토큰을 통해 인증된 사용자의 상세 정보
     * @return ApiResponse<UserResponseDTO> 형태의 사용자 정보
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getMyInfo(
            @AuthenticationPrincipal LoginUserDTO loginUser) {

        // @AuthenticationPrincipal을 통해 JWT 토큰에 담긴 사용자 정보를 바로 주입
        if (loginUser == null) {
            // 이 경우는 보통 JWT 필터에서 먼저 처리되지만, 만약을 위한 방어 코드입니다.
            ApiResponse<UserResponseDTO> response = new ApiResponse<>(false, "인증된 사용자를 찾을 수 없습니다.", null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

//        // 2. CustomUserDetails 객체에서 우리 서비스의 User 엔티티를 가져옵니다.
//        User loggedInUser = userDetails.getUser();
//
//        // 3. User 엔티티를 프론트엔드로 보낼 UserResponseDTO로 변환합니다.
//        UserResponseDTO userResponse = new UserResponseDTO(
//                loggedInUser.getUsername(),
//                loggedInUser.getEmail()
//                // 필요하다면 다른 정보(프로필 이미지 경로 등)도 추가할 수 있습니다.
//        );

        // 성공 응답을 반환
        ApiResponse<UserResponseDTO> response = userService.getUserById(loginUser.id());

        if (response.success()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

//    @GetMapping("/id-check")
//    public Map<String,Boolean> idCheck(@RequestParam String username) {
//        boolean available = !userRepository.existsByUsername(username);
//        return Map.of("available", available);
//    }
//
//    @GetMapping("/email-check")
//    public Map<String,Boolean> emailCheck(@RequestParam String email) {
//        boolean available = !userRepository.existsByEmail(email);
//        return Map.of("available", available);
//    }
//
//    @GetMapping("/find-id")
//    public ApiResponse<String> findId(@RequestParam String email){
//        return userService.findUsernameByEmail(email);
//    }

    /**
     * 재학생 인증을 위한 이메일 발송을 요청하는 API
     */
    @PostMapping("/verify-student/request")
    public ResponseEntity<ApiResponse<Void>> requestVerification(
            @AuthenticationPrincipal LoginUserDTO loginUser,
            @Valid @RequestBody StudentVerificationRequestDTO request) {

        ApiResponse<Void> response = userService.requestStudentVerification(loginUser.id(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자가 이메일에서 링크를 클릭했을 때, 토큰을 검증하고 인증을 완료하는 API
     */
    @GetMapping("/verify-student/confirm")
    public ResponseEntity<ApiResponse<String>> confirmVerification(@RequestParam("token") String token) {
        ApiResponse<String> response = userService.confirmStudentVerification(token);
        // 실제 서비스에서는 성공 시, "인증 완료" 페이지로 리다이렉트 시키는 것이 더 좋아.
        // 예: return ResponseEntity.status(HttpStatus.FOUND).location(URI.create("http://localhost:5173/verification-success")).build();
        return ResponseEntity.ok(response);
    }
}
