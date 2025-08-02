package com.hongik.books.domain.user.service;

import com.hongik.books.common.util.GcpStorageUtil;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.common.dto.ApiResponse;
import com.hongik.books.domain.user.dto.StudentVerificationRequestDTO;
import com.hongik.books.domain.user.dto.UserResponseDTO;
import com.hongik.books.domain.user.dto.UserRequestDTO;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final MailService mailService;
    private final GcpStorageUtil gcpStorageUtil;

    // 회원 정보 수정
    public ApiResponse<UserResponseDTO> updateUser(Long userId, UserRequestDTO userRequestDTO) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return new ApiResponse<>(false, "해당 사용자를 찾을 수 없습니다.", null);
        }

        User user = userOptional.get();
        // User 엔티티의 update 메서드를 호출
        user.updateProfile(userRequestDTO.username(), userRequestDTO.profileImagePath());

        UserResponseDTO userResponse = new UserResponseDTO(
                user.getUsername(),
                user.getEmail(),
                user.isStudentVerified(),
                user.getUnivEmail());
        return new ApiResponse<>(true, "사용자 정보가 성공적으로 수정되었습니다.", userResponse);
    }

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

    /**
     * TODO: 프로필 이미지 변경 기능
     */
    public String updateProfileImage(Long userId, MultipartFile imageFile) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // TODO: User Entity에 setProfileImagePath(String url) 메서드 추가 후 주석 해제
        // user.setProfileImagePath(profileImageUrl);

        return gcpStorageUtil.uploadImage(imageFile, "profile-images");
    }
}
