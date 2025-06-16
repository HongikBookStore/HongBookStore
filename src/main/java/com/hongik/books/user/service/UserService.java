package com.hongik.books.user.service;

import com.hongik.books.auth.JwtTokenProvider;
import com.hongik.books.user.domain.User;
import com.hongik.books.user.dto.ApiResponse;
import com.hongik.books.user.dto.SignUpRequest;
import com.hongik.books.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public ApiResponse<Long> signUp(SignUpRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            return new ApiResponse<>(false, "이미 사용중인 이메일입니다.", null);
        }
        if (userRepository.existsByUsername(req.username())) {
            return new ApiResponse<>(false, "이미 사용중인 아이디입니다.", null);
        }
        User user = User.builder()
                .email(req.email())
                .username(req.username())
                .passwordHash(encoder.encode(req.password()))
                .build();
        user = userRepository.save(user);
        return new ApiResponse<>(true, "회원가입이 완료되었습니다.", user.getId());
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public ApiResponse<User> verifyLogin(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(u -> encoder.matches(password, u.getPasswordHash()))
                .map(u -> new ApiResponse<>(true, "Login Success", u))
                .orElseGet(() -> new ApiResponse<>(false, "아이디 또는 비밀번호가 일치하지 않습니다.", null));
    }

    public ApiResponse<String> loginAndIssueToken(String username, String rawPw) {
        return userRepository.findByUsername(username)
                .filter(u -> encoder.matches(rawPw, u.getPasswordHash()))
                .map(u -> {
                    // 사용자 역할 결정 로직
                    List<String> roles = determineUserRoles(u);

                    // roles 정보를 포함한 토큰 생성
                    String token = jwtTokenProvider.createTokenWithRoles(u.getId(), roles);

                    return new ApiResponse<>(true, "OK", token);
                })
                .orElseGet(() -> new ApiResponse<>(false, "아이디/비번 오류", null));
    }

    @Transactional(readOnly = true)
    public ApiResponse<String> findUsernameByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(u -> new ApiResponse<>(true, "OK", u.getUsername()))
                .orElseGet(() -> new ApiResponse<>(false, "존재하지 않는 이메일입니다.", null));
    }

    @Transactional
    public void verifyStudent(Long userId) {
        userRepository.findById(userId).ifPresent(u -> u.setStudentVerified(true));
    }

    /**
     * 사용자의 역할을 결정하는 메서드
     * User 엔티티의 속성에 따라 적절한 역할을 반환
     */
    private List<String> determineUserRoles(User user) {
        // 사용자 속성에 따른 역할 결정 로직
        if (user.isStudentVerified()) {
            return List.of("USER", "STUDENT");
        } else if (user.getUsername().equals("admin")) {
            return List.of("USER", "ADMIN");
        } else {
            return List.of("USER");
        }
    }
}
