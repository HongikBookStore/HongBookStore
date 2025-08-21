package com.hongik.books.domain.wanted.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.common.dto.ApiResponse;
import com.hongik.books.domain.wanted.dto.*;
import com.hongik.books.domain.wanted.service.WantedService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wanted")
@RequiredArgsConstructor
public class WantedController {

    private final WantedService wantedService;

    @PostMapping
    public ResponseEntity<ApiResponse<Long>> create(
            @AuthenticationPrincipal LoginUserDTO loginUser,
            @RequestBody WantedCreateRequestDTO dto
    ) {
        Long id = wantedService.create(loginUser.id(), dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "구해요 글이 등록되었습니다.", id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<WantedSummaryResponseDTO>>> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Page<WantedSummaryResponseDTO> page = wantedService.list(pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "구해요 목록 조회 성공", page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WantedDetailResponseDTO>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "구해요 상세 조회 성공", wantedService.get(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> update(
            @PathVariable Long id,
            @AuthenticationPrincipal LoginUserDTO loginUser,
            @RequestBody WantedUpdateRequestDTO dto
    ) {
        wantedService.update(loginUser.id(), id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "구해요 글이 수정되었습니다.", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal LoginUserDTO loginUser
    ) {
        wantedService.delete(loginUser.id(), id);
        return ResponseEntity.ok(new ApiResponse<>(true, "구해요 글이 삭제되었습니다.", null));
    }
}