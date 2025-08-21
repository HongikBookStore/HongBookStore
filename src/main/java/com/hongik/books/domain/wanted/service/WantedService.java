package com.hongik.books.domain.wanted.service;

import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import com.hongik.books.domain.wanted.domain.Wanted;
import com.hongik.books.domain.wanted.dto.*;
import com.hongik.books.domain.wanted.repository.WantedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WantedService {

    private final WantedRepository wantedRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long create(Long userId, WantedCreateRequestDTO dto) {
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        Wanted wanted = Wanted.builder()
                .requester(requester)
                .title(dto.getTitle())
                .author(dto.getAuthor())
                .desiredCondition(dto.getCondition())
                .price(dto.getPrice())
                .category(dto.getCategory())
                .content(dto.getContent())
                .build();

        wantedRepository.save(wanted);
        return wanted.getId();
    }

    public Page<WantedSummaryResponseDTO> list(Pageable pageable) {
        return wantedRepository.findAll(pageable).map(WantedSummaryResponseDTO::from);
    }

    public WantedDetailResponseDTO get(Long id) {
        Wanted wanted = wantedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구해요 글을 찾을 수 없습니다: " + id));
        return WantedDetailResponseDTO.from(wanted);
    }

    @Transactional
    public void update(Long userId, Long id, WantedUpdateRequestDTO dto) {
        Wanted wanted = wantedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구해요 글을 찾을 수 없습니다: " + id));
        if (!wanted.getRequester().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 글만 수정할 수 있습니다.");
        }
        wanted.update(dto.getTitle(), dto.getAuthor(), dto.getCondition(), dto.getPrice(), dto.getCategory(), dto.getContent());
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Wanted wanted = wantedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구해요 글을 찾을 수 없습니다: " + id));
        if (!wanted.getRequester().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 글만 삭제할 수 있습니다.");
        }
        wantedRepository.delete(wanted);
    }
}