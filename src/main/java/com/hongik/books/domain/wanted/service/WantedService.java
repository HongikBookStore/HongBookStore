package com.hongik.books.domain.wanted.service;

import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import com.hongik.books.domain.wanted.domain.Wanted;
import com.hongik.books.domain.wanted.dto.*;
import com.hongik.books.domain.wanted.repository.WantedRepository;
import com.hongik.books.domain.wanted.repository.WantedSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WantedService {

    private final WantedRepository wantedRepository;
    private final UserRepository userRepository;

    public Page<WantedSummaryResponseDTO> search(
            String category, String department, String keyword,
            int page, int size, String sort
    ) {
        Sort s = switch (sort) {
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "price");
            case "priceAsc"  -> Sort.by(Sort.Direction.ASC,  "price");
            case "oldest"    -> Sort.by(Sort.Direction.ASC,  "createdAt");
            default /*latest*/ -> Sort.by(Sort.Direction.DESC, "createdAt");
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

        Wanted wanted = Wanted.builder()
                .requester(requester)
                .title(dto.getTitle())
                .author(dto.getAuthor())
                .desiredCondition(dto.getCondition())
                .price(dto.getPrice())
                .category(dto.getCategory())
                .department("전공".equals(dto.getCategory()) ? emptyToNull(dto.getDepartment()) : null)
                .content(dto.getContent())
                .build();

        return wantedRepository.save(wanted).getId();
    }

    @Transactional
    public void update(Long userId, Long id, WantedUpdateRequestDTO dto) {
        Wanted wanted = wantedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구해요 글을 찾을 수 없습니다: " + id));
        if (!wanted.getRequester().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 글만 수정할 수 있습니다.");
        }

        wanted.update(
                dto.getTitle(),
                dto.getAuthor(),
                dto.getCondition(),
                dto.getPrice(),
                dto.getCategory(),
                "전공".equals(dto.getCategory()) ? emptyToNull(dto.getDepartment()) : null,
                dto.getContent()
        );
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
