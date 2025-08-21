package com.hongik.books.domain.comment.dto;

import com.hongik.books.domain.comment.domain.WantedComment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WantedCommentDto {
    private Long id;
    private Long wantedId;
    private Long parentId;
    private Integer depth;
    private String content;
    private Long userId;
    private String nickname;        // 화면 표기용
    private String authorNickname;  // NOT NULL 보장
    private boolean deleted;
    private LocalDateTime createdAt;

    public static WantedCommentDto from(WantedComment c) {
        return WantedCommentDto.builder()
                .id(c.getId())
                .wantedId(c.getWantedId())
                .parentId(c.getParentId())
                .depth(c.getDepth())
                .content(c.getContent())
                .userId(c.getUserId())
                .nickname(c.getNickname())
                .authorNickname(c.getAuthorNickname())
                .deleted(c.isDeleted())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
