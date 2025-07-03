package com.hongik.books.domain.user.service;

import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.domain.UserRole;
import com.hongik.books.common.exception.dto.ApiResponse;
import com.hongik.books.domain.user.dto.UserResponseDTO;
import com.hongik.books.domain.user.dto.UserRequestDTO;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    public ApiResponse<Long> signUp(UserRequestDTO request) {
        validateEmail(request.email()); // 이메일 중복 체크
        if (userRepository.existsByUsername(request.username())) {
            return new ApiResponse<>(false, "이미 사용중인 아이디입니다.", null);
        }

        // 비밀번호 암호화
        String encodedPassword = getEncode(request);

        // 이메일 인증용 토큰 생성
        String verificationToken = UUID.randomUUID().toString();

        // 회원 생성
        User user = User.builder()
                .email(request.email())
                .username(request.username())
                .password(encodedPassword)
                .role(UserRole.USER) // 일반 가입자는 기본적으로 'USER' 역할을 가집니다.
                .socialUser(false)   // 일반 가입자이므로 socialUser는 false 입니다.
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .enabled(false) // 이메일 인증 전까지는 비활성화 상태
                .mailVerificationToken(verificationToken)
                .build();

        // 인증 메일 전송
        String subject = "[홍북서점] 회원가입 이메일 인증";
        String verificationUrl = "http://localhost:8080/api/users/verify/" + verificationToken;
        String text = "회원가입을 완료하려면 아래 링크를 클릭하세요: " + verificationUrl;
        mailService.sendEmail(user.getEmail(), subject, text);

        // 회원 저장
        user = userRepository.save(user);
        return new ApiResponse<>(true, "회원가입이 완료되었습니다.", user.getId());
    }

    // 이메일 검증
    public ApiResponse<UserResponseDTO> verifyEmail(String token) {
        try {
            // 토큰으로 사용자 찾기
            Optional<User> userOpt = userRepository.findByMailVerificationToken(token);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.verifyEmail(); // 도메인 메서드 사용
                userRepository.save(user);

                UserResponseDTO userResponse = new UserResponseDTO(user.getUsername(), user.getEmail());
                return new ApiResponse<>(true, "이메일 인증이 완료되었습니다.", userResponse);
            } else {
                return new ApiResponse<>(false, "유효하지 않은 인증 토큰입니다.", null);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "이메일 인증 중 오류가 발생했습니다.", null);
        }
    }

    // 회원 정보 수정
    public ApiResponse<UserResponseDTO> updateUser(Long userId, UserRequestDTO userRequestDTO) {
        try {
            return userRepository.findById(userId).map(user -> {
                if (!user.getEmail().equals(userRequestDTO.email())) {
                    validateEmail(userRequestDTO.email());
                }

                String verificationToken = UUID.randomUUID().toString(); // 정보 수정을 위한 이메일 인증에 담을 토큰
                user.updateUser(userRequestDTO, passwordEncoder,  verificationToken);

                // 인증 메일 전송 로직 수정
                String subject = "[홍북서점] 회원 정보 수정 이메일 인증";
                String verificationUrl = "http://localhost:8080/api/users/verify/" + verificationToken;
                String text = "회원 정보 수정을 완료하려면 아래 링크를 클릭하세요: " + verificationUrl;
                mailService.sendEmail(userRequestDTO.email(), subject, text);

                userRepository.save(user);
                UserResponseDTO userResponse = new UserResponseDTO(user.getUsername(), user.getEmail());

                return new ApiResponse<>(true, "사용자 정보가 성공적으로 수정되었습니다.", userResponse);
            }).orElse(new ApiResponse<>(false, "사용자를 찾을 수 없습니다.", null));

        } catch (Exception e) {
            return new ApiResponse<>(false, "사용자 정보 수정 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }

    // 이메일 중복 체크 메서드
    private void validateEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("이미 사용중인 이메일입니다.");
        }
    }

    // 이메일 토큰을 사용하여 사용자 조회
    private User findUserByVerificationToken(String token) {
        return userRepository.findByMailVerificationToken(token)
                .orElseThrow(() -> new IllegalStateException("유효한 토큰이 없습니다."));
    }

    // 비밀번호 암호화
    private String getEncode(UserRequestDTO request) {
        return passwordEncoder.encode(request.password());
    }

    // 회원 정보 조회
    public ApiResponse<UserResponseDTO> getUserById(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            UserResponseDTO userResponse = new UserResponseDTO(
                    user.get().getUsername(),
                    user.get().getEmail()
            );
            return new ApiResponse<>(true, "사용자 조회 성공", userResponse);
        } else {
            return new ApiResponse<>(false, "사용자를 찾을 수 없습니다.", null);
        }
    }

    // 회원 삭제
    public ApiResponse<String> deleteUser(Long userId) {
        try {
            if (userRepository.existsById(userId)) {
                userRepository.deleteById(userId);
                return new ApiResponse<>(true, "사용자가 성공적으로 삭제되었습니다.", null);
            } else {
                return new ApiResponse<>(false, "사용자를 찾을 수 없습니다.", null);
            }
        } catch (Exception e) {
            return new ApiResponse<>(false, "사용자 삭제 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional(readOnly = true)
    public ApiResponse<String> findUsernameByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(u -> new ApiResponse<>(true, "OK", u.getUsername()))
                .orElseGet(() -> new ApiResponse<>(false, "존재하지 않는 이메일입니다.", null));
    }
}
