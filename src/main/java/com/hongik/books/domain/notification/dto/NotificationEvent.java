package com.hongik.books.domain.notification.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String id;          // SSE 이벤트 고유 ID
    private String type;        // "CHAT", "WANTED_COMMENT", "PING"
    private String title;       // 짧은 제목
    private String message;     // 상세 메시지
    private String link;        // 프론트에서 이동할 경로
    private Instant createdAt;  // 생성 시각
}
