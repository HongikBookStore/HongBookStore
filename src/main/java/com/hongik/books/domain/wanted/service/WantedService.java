package com.hongik.books.domain.wanted.service;

import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import com.hongik.books.domain.wanted.domain.Wanted;
import com.hongik.books.domain.wanted.dto.*;
import com.hongik.books.domain.wanted.repository.WantedRepository;
import com.hongik.books.domain.wanted.repository.WantedSpecifications;
import com.hongik.books.domain.comment.repository.WantedCommentRepository; // ✅ 추가
import lombok.RequiredArgsConstructor;
import com.hongik.books.moderation.ModerationPolicyProperties;
import com.hongik.books.moderation.ModerationService;
import org.springframework.data.domain.*;
import org.springframework.util.StringUtils;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WantedService {

    private final WantedRepository wantedRepository;
    private final UserRepository userRepository;
    private final WantedCommentRepository wantedCommentRepository; // ✅ 추가
    private final ModerationService moderationService;
    private final ModerationPolicyProperties moderationPolicy;

    public Page<WantedSummaryResponseDTO> search(
            String category, String department, String keyword,
            int page, int size, String sort
    ) {
        Sort s = switch (sort) {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "priceAsc" -> Sort.by(Sort.Direction.ASC, "price");
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "price");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        Pageable pageable = PageRequest.of(page, size, s);

        Specification<Wanted> spec = Specification
                .where(WantedSpecifications.categoryEquals(category))
                .and(WantedSpecifications.departmentEquals(department))
                .and(WantedSpecifications.keywordContains(keyword));

        return wantedRepository.findAll(spec, pageable).map(WantedSummaryResponseDTO::from);
    }

    public WantedDetailResponseDTO getDetail(Long id) {
        Wanted w = wantedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구해요 글을 찾을 수 없습니다: " + id));
        return WantedDetailResponseDTO.from(w);
    }

    @Transactional
    public Long create(Long userId, WantedCreateRequestDTO dto) {
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 정책 기반 유해 표현 검사 (title, content)
        var titleMode = moderationPolicy.getWanted().getTitle();
        var contentMode = moderationPolicy.getWanted().getContent();
        if (StringUtils.hasText(dto.getTitle())) {
            moderationService.checkOrThrow(dto.getTitle(), titleMode, "title");
        }
        var contentModeration = moderationService.checkOrThrow(dto.getContent(), contentMode, "content");

        String safeTitle = deriveTitle(dto.getTitle(), dto.getContent());
        String safeAuthor = deriveAuthor(dto.getAuthor());

        Wanted wanted = Wanted.builder()
                .requester(requester)
                .title(safeTitle)
                .author(safeAuthor)
                .desiredCondition(dto.getCondition())
                .price(dto.getPrice())
                .category(dto.getCategory())
                .department("전공".equals(dto.getCategory()) ? emptyToNull(dto.getDepartment()) : null)
                .content(dto.getContent())
                .build();
        if (contentModeration != null) {
            wanted.applyContentModeration(
                    contentModeration.predictionLevel(),
                    contentModeration.malicious(),
                    contentModeration.clean(),
                    contentModeration.blocked(),
                    contentModeration.reason()
            );
        }
        return wantedRepository.save(wanted).getId();
    }

    @Transactional
    public void update(Long userId, Long id, WantedUpdateRequestDTO dto) {
        Wanted w = wantedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구해요 글을 찾을 수 없습니다: " + id));

        if (w.getRequester() == null || w.getRequester().getId() == null || !w.getRequester().getId().equals(userId)) {
            throw new SecurityException("권한이 없습니다.");
        }

        // 정책 기반 유해 표현 검사 (title, content)
        var titleMode = moderationPolicy.getWanted().getTitle();
        var contentMode = moderationPolicy.getWanted().getContent();
        if (StringUtils.hasText(dto.getTitle())) {
            moderationService.checkOrThrow(dto.getTitle(), titleMode, "title");
        }
        var contentModeration = moderationService.checkOrThrow(dto.getContent(), contentMode, "content");

        String safeTitle = deriveTitle(dto.getTitle(), dto.getContent());
        String safeAuthor = deriveAuthor(dto.getAuthor());
        w.update(
                safeTitle,
                safeAuthor,
                dto.getCondition(),
                dto.getPrice(),
                dto.getCategory(),
                "전공".equals(dto.getCategory()) ? emptyToNull(dto.getDepartment()) : null,
                dto.getContent()
        );
        if (contentModeration != null) {
            w.applyContentModeration(
                    contentModeration.predictionLevel(),
                    contentModeration.malicious(),
                    contentModeration.clean(),
                    contentModeration.blocked(),
                    contentModeration.reason()
            );
        }
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private String deriveTitle(String title, String content) {
        if (StringUtils.hasText(title)) return title.trim();
        if (StringUtils.hasText(content)) {
            String t = content.strip();
            t = t.replaceAll("\n+", " ");
            return t.length() > 30 ? t.substring(0, 30) + "…" : t;
        }
        return "구해요 요청"; // 최종 폴백
    }

    private String deriveAuthor(String author) {
        return StringUtils.hasText(author) ? author.trim() : "미상";
    }

    @Transactional
    public void delete(Long userId, Long id) {
        // 1) 글 존재 확인
        Wanted w = wantedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구해요 글을 찾을 수 없습니다: " + id));

        // 2) 작성자 본인 확인
        if (w.getRequester() == null || w.getRequester().getId() == null || !w.getRequester().getId().equals(userId)) {
            throw new SecurityException("권한이 없습니다.");
        }

        // 3) 댓글을 '자식 → 부모' 순으로 먼저 삭제 (self-FK 충돌 예방)
        wantedCommentRepository.deleteChildrenByWantedId(id);
        wantedCommentRepository.deleteParentsByWantedId(id);

        // 4) 글 삭제
        wantedRepository.delete(w);
    }
}
