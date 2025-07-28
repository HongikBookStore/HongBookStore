package com.hongik.books.domain.user.service;

import com.hongik.books.auth.jwt.JwtTokenProvider;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.common.dto.ApiResponse;
import com.hongik.books.domain.user.dto.LoginResponseDTO;
import com.hongik.books.domain.user.dto.StudentVerificationRequestDTO;
import com.hongik.books.domain.user.dto.UserResponseDTO;
import com.hongik.books.domain.user.dto.UserRequestDTO;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    // private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

//    public ApiResponse<Long> signUp(UserRequestDTO request) {
//        validateEmail(request.email()); // 이메일 중복 체크
//        if (userRepository.existsByUsername(request.username())) {
//            return new ApiResponse<>(false, "이미 사용중인 아이디입니다.", null);
//        }
//
//        // 비밀번호 암호화
//        String encodedPassword = getEncode(request);
//
//        // 이메일 인증용 토큰 생성
//        String verificationToken = UUID.randomUUID().toString();
//
//        // 회원 생성
//        User user = User.builder()
//                .email(request.email())
//                .username(request.username())
//                .password(encodedPassword)
//                .role(UserRole.USER) // 일반 가입자는 기본적으로 'USER' 역할을 가집니다.
//                .socialUser(false)   // 일반 가입자이므로 socialUser는 false 입니다.
//                .accountNonExpired(true)
//                .accountNonLocked(true)
//                .credentialsNonExpired(true)
//                .enabled(false) // 이메일 인증 전까지는 비활성화 상태
//                .mailVerificationToken(verificationToken)
//                .build();
//
//        // 인증 메일 전송
//        String subject = "[홍북서점] 회원가입 이메일 인증";
//        String verificationUrl = "http://localhost:8080/api/users/verify/" + verificationToken;
//        String text = "회원가입을 완료하려면 아래 링크를 클릭하세요: " + verificationUrl;
//        mailService.sendEmail(user.getEmail(), subject, text);
//
//        // 회원 저장
//        user = userRepository.save(user);
//        return new ApiResponse<>(true, "회원가입이 완료되었습니다.", user.getId());
//    }
//
//    // 이메일 검증
//    public ApiResponse<UserResponseDTO> verifyEmail(String token) {
//        try {
//            // 토큰으로 사용자 찾기
//            Optional<User> userOpt = userRepository.findByMailVerificationToken(token);
//
//            if (userOpt.isPresent()) {
//                User user = userOpt.get();
//                user.verifyEmail(); // 도메인 메서드 사용
//                userRepository.save(user);
//
//                UserResponseDTO userResponse = new UserResponseDTO(user.getUsername(), user.getEmail());
//                return new ApiResponse<>(true, "이메일 인증이 완료되었습니다.", userResponse);
//            } else {
//                return new ApiResponse<>(false, "유효하지 않은 인증 토큰입니다.", null);
//            }
//        } catch (Exception e) {
//            return new ApiResponse<>(false, "이메일 인증 중 오류가 발생했습니다.", null);
//        }
//    }

    // 회원 정보 수정
    public ApiResponse<UserResponseDTO> updateUser(Long userId, UserRequestDTO userRequestDTO) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return new ApiResponse<>(false, "해당 사용자를 찾을 수 없습니다.", null);
        }

        User user = userOptional.get();
        // User 엔티티의 update 메서드를 호출
        user.updateProfile(userRequestDTO.username(), userRequestDTO.profileImagePath());

        // userRepository.save(user); // @Transactional 어노테이션 덕분에 명시적으로 save 호출 안 해도 돼 (더티 체킹)

        UserResponseDTO userResponse = new UserResponseDTO(
                user.getUsername(),
                user.getEmail(),
                user.isStudentVerified(),
                user.getUnivEmail());
        return new ApiResponse<>(true, "사용자 정보가 성공적으로 수정되었습니다.", userResponse);
    }

//    // 이메일 중복 체크 메서드
//    private void validateEmail(String email) {
//        if (userRepository.existsByEmail(email)) {
//            throw new IllegalStateException("이미 사용중인 이메일입니다.");
//        }
//    }
//
//    // 이메일 토큰을 사용하여 사용자 조회
//    private User findUserByVerificationToken(String token) {
//        return userRepository.findByMailVerificationToken(token)
//                .orElseThrow(() -> new IllegalStateException("유효한 토큰이 없습니다."));
//    }
//
//    // 비밀번호 암호화
//    private String getEncode(UserRequestDTO request) {
//        return passwordEncoder.encode(request.password());
//    }

    // 회원 정보 조회
    @Transactional(readOnly = true)
    public ApiResponse<UserResponseDTO> getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    UserResponseDTO userResponse = new UserResponseDTO(
                            user.getUsername(),
                            user.getEmail(),
                            user.isStudentVerified(),
                            user.getUnivEmail());
                    return new ApiResponse<>(true, "사용자 조회 성공", userResponse);
                })
                .orElse(new ApiResponse<>(false, "사용자를 찾을 수 없습니다.", null));
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

//    public Optional<User> findByUsername(String username) {
//        return userRepository.findByUsername(username);
//    }
//
//    @Transactional(readOnly = true)
//    public ApiResponse<String> findUsernameByEmail(String email) {
//        return userRepository.findByEmail(email)
//                .map(u -> new ApiResponse<>(true, "OK", u.getUsername()))
//                .orElseGet(() -> new ApiResponse<>(false, "존재하지 않는 이메일입니다.", null));
//    }

    /**
     * 재학생 인증 메일 발송을 요청
     */
    public ApiResponse<Void> requestStudentVerification(Long userId, StudentVerificationRequestDTO request) {
        String univEmail = request.univEmail();

        // 이미 다른 사용자가 해당 이메일로 인증을 완료했는지 확인
        if (userRepository.existsByUnivEmailAndStudentVerifiedIsTrue(univEmail)) {
            return new ApiResponse<>(false, "이미 인증에 사용된 이메일입니다.", null);
        }

        // 요청한 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 인증 토큰 생성 및 사용자 정보 업데이트
        String token = UUID.randomUUID().toString();
        user.startStudentVerification(univEmail, token);

        // 인증 메일 발송
        String subject = "[홍북서점] 재학생 인증을 완료해주세요.";
        String verificationUrl = "http://localhost:5173/verify-student?token=" + token; // ❗️ 프론트엔드 URL로 변경
        String text = "홍북서점 재학생 인증을 완료하려면 아래 링크를 클릭하세요: " + verificationUrl;
        mailService.sendEmail(univEmail, subject, text);

        return new ApiResponse<>(true, "인증 메일이 발송되었습니다. 메일함을 확인해주세요.", null);
    }

    /**
     * 이메일 링크의 토큰을 검증, 인증 성공 시 새로운 JWT 발급
     */
    public ApiResponse<User> confirmStudentVerification(String token) {
        // 토큰으로 사용자 조회
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 인증 토큰입니다."));

        // 인증 완료 처리
        user.completeStudentVerification();
        user.upgradeToStudentRole();

        return new ApiResponse<>(true, "재학생 인증이 성공적으로 완료되었습니다.", user);
    }
}
