package com.hongik.books.domain.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hongik.books.domain.notification.dto.NotificationEvent;
import com.hongik.books.domain.notification.sse.EmitterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

// ✅ 프로젝트에 맞게 import만 조정하세요.
// 예: com.hongik.books.domain.user.repository.UserRepository (findByEmail(String) 존재 가정)
import com.hongik.books.domain.user.repository.UserRepository;
import com.hongik.books.domain.user.domain.User;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final long DEFAULT_TIMEOUT = 30 * 60 * 1000L; // 30분

    private final EmitterRepository emitterRepository;
    private final ObjectMapper objectMapper;

    // 리포지토리 선택적 주입(없어도 컴파일되게 Optional 사용)
    private final Optional<UserRepository> userRepository;

    @PostConstruct
    void initMapper() {
        try { objectMapper.findAndRegisterModules(); } catch (Exception ignore) {}
    }

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        emitterRepository.add(userId, emitter);

        try {
            NotificationEvent ping = NotificationEvent.builder()
                    .id(UUID.randomUUID().toString())
                    .type("PING")
                    .title("connected")
                    .message("SSE connected")
                    .link(null)
                    .createdAt(Instant.now())
                    .build();
            sendInternal(emitter, ping);
        } catch (Exception e) {
            log.warn("Failed to send initial event to user {}", userId, e);
        }
        return emitter;
    }

    // ====== 여기부터 알림 발행 ======

    // 채팅 알림 (기존 호출부가 보낸 senderName이 '이메일'이어도 알아서 username으로 변환)
    public void notifyChatMessage(Long userId, Long roomId, Long salePostId, String senderNameOrEmail, String message) {
        String display = resolveDisplayName(senderNameOrEmail);
        NotificationEvent evt = NotificationEvent.builder()
                .id(UUID.randomUUID().toString())
                .type("CHAT")
                .title("새 채팅 메시지")
                .message((display != null ? display + ": " : "") + safe(message))
                .link("/chat/" + roomId + (salePostId != null ? ("?post=" + salePostId) : ""))
                .createdAt(Instant.now())
                .build();
        sendToUser(userId, evt);
    }

    // 구해요 댓글 알림 (commenterAlias가 이메일이면 username으로 변환)
    public void notifyWantedComment(Long ownerUserId, Long wantedId, String commenterAliasOrEmail, String commentSnippet) {
        String display = resolveDisplayName(commenterAliasOrEmail);
        NotificationEvent evt = NotificationEvent.builder()
                .id(UUID.randomUUID().toString())
                .type("WANTED_COMMENT")
                .title("구해요 댓글")
                .message((display != null ? display + "님의 새 댓글: " : "새 댓글: ")
                        + truncate(safe(commentSnippet), 80))
                .link("/wanted/" + wantedId)
                .createdAt(Instant.now())
                .build();
        sendToUser(ownerUserId, evt);
    }

    public void sendToUser(Long userId, NotificationEvent event) {
        Map<String, SseEmitter> map = emitterRepository.get(userId);
        if (map.isEmpty()) {
            log.debug("No active SSE emitters for user {}", userId);
            return;
        }
        for (SseEmitter emitter : map.values()) {
            try {
                sendInternal(emitter, event);
            } catch (Exception e) {
                emitterRepository.remove(userId, emitter);
                log.warn("Emitter removed for user {} due to error", userId, e);
            }
        }
    }

    private void sendInternal(SseEmitter emitter, NotificationEvent event) throws IOException {
        emitter.send(SseEmitter.event()
                .id(event.getId())
                .name("notification")
                .data(objectMapper.writeValueAsString(event)));
    }

    // ====== 표시명 변환 유틸 ======

    private String resolveDisplayName(String raw) {
        if (raw == null || raw.isBlank()) return "사용자";
        String s = raw.trim();

        // 이메일 형태면 -> 리포지토리로 username 조회, 실패하면 로컬파트로 대체
        if (looksLikeEmail(s)) {
            String localPart = s.substring(0, s.indexOf('@'));
            try {
                if (userRepository != null && userRepository.isPresent()) {
                    return userRepository.get().findByEmail(s)
                            .map(this::userDisplayName)
                            .orElse(localPart);
                }
            } catch (Exception ignore) {}
            return localPart;
        }
        // 이미 username/닉네임이면 그대로
        return s;
    }

    private boolean looksLikeEmail(String s) {
        return s.contains("@") && !s.startsWith("@") && s.indexOf('@') < s.length() - 1;
    }

    private String userDisplayName(User u) {
        String name = firstNonBlank(u.getUsername(), tryNickname(u));
        return name != null ? name : "사용자";
    }

    private String tryNickname(User u) {
        try { return (String) User.class.getMethod("getNickname").invoke(u); }
        catch (Exception e) { return null; }
    }

    private String firstNonBlank(String... arr) {
        if (arr == null) return null;
        for (String s : arr) if (s != null && !s.isBlank()) return s.trim();
        return null;
    }

    private String safe(String s) { return s == null ? "" : s; }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
