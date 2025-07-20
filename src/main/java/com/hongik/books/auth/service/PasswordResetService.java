package com.hongik.books.auth.service;

import com.hongik.books.auth.jwt.JwtTokenProvider;
import com.hongik.books.auth.jwt.JwtTokenRedisRepository;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import com.hongik.books.domain.user.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PasswordResetService {
    private final UserRepository userRepository;
    private final MailService mailService;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtTokenRedisRepository jwtTokenRedisRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    /**
     * 비밀번호 재설정 링크를 생성하고 이메일로 발송합니다.
     * @param email 재설정을 요청한 사용자의 이메일
     */
    public void sendPasswordResetLink(String email) {
        // 이메일로 사용자가 존재하는지 확인합니다. 존재하지 않아도 에러를 반환하지 않습니다. (보안)
        userRepository.findByEmail(email).ifPresent(user -> {
            // 1. 비밀번호 재설정용 JWT 생성 (유효시간 15분)
            String token = jwtTokenProvider.createPasswordResetToken(user.getUsername());

            // 2. 프론트엔드의 비밀번호 재설정 페이지 URL 생성
            String resetUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl)
                    .path("/reset-password")
                    .queryParam("token", token)
                    .build().toUriString();

            // 3. 이메일 제목과 본문 내용 구성
            String subject = "[홍북서점] 비밀번호 재설정 안내";
            String text = String.format(
                    """
                            안녕하세요, %s 님.
                            
                            비밀번호를 재설정하려면 아래 링크를 클릭하세요. (링크는 15분간 유효합니다.)
                            %s
                            
                            만약 직접 요청하지 않으셨다면 이 메일을 무시해 주세요.""",
                    user.getUsername(), resetUrl
            );

            // 4. MailService를 통해 이메일 발송
            mailService.sendEmail(email, subject, text);
            log.info("비밀번호 재설정 이메일 발송 완료: {}", email);
        });
    }

    /**
     * 토큰을 검증하고 새 비밀번호로 업데이트합니다.
     * @param token 이메일로 받은 재설정 토큰
     * @param newPassword 사용자가 새로 설정할 비밀번호
     * @return 성공 여부 (true/false)
     */
    public boolean resetPassword(String token, String newPassword) {
        // 1. 토큰의 유효성(형식, 만료시간, 시그니처)과 타입("password-reset")을 검증
        if (!jwtTokenProvider.validateToken(token) || !jwtTokenProvider.isPasswordResetToken(token)) {
            log.warn("유효하지 않은 비밀번호 재설정 토큰입니다: {}", token);
            return false;
        }

        // 2. Redis에 해당 토큰이 블랙리스트(이미 사용됨)로 등록되어 있는지 확인
        if (jwtTokenRedisRepository.hasKey(token)) {
            log.warn("이미 사용된 비밀번호 재설정 토큰입니다: {}", token);
            return false;
        }

        // 3. 토큰에서 사용자 정보(username)를 추출하여 DB에서 사용자 조회
        String username = jwtTokenProvider.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("토큰에 해당하는 사용자를 찾을 수 없습니다."));

        // 4. 사용자의 비밀번호를 새 비밀번호로 업데이트 (반드시 암호화)
        user.updatePassword(passwordEncoder.encode(newPassword));
        // @Transactional에 의해 메서드 종료 시 영속성 컨텍스트의 변경이 DB에 반영됩니다.

        // 5. 성공적으로 사용된 토큰을 Redis에 블랙리스트로 등록하여 재사용 방지
        long expiration = jwtTokenProvider.getExpiration(token);
        jwtTokenRedisRepository.set(token, "used", expiration);
        log.info("사용자 [{}]의 비밀번호가 성공적으로 재설정되었습니다.", username);

        return true;
    }
}
