// com/hongik/books/domain/report/controller/ReportController.java
package com.hongik.books.domain.report.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.domain.report.dto.ReportDtos;
import com.hongik.books.domain.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ReportDtos.CreateReq req) {
        LoginUserDTO loginUser = currentLoginUserOrNull();
        // ReportService에서 loginUser null이면 401을 던지므로 여기선 그대로 넘김
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.create(req, loginUser));
    }

    /** SecurityContext에서 LoginUserDTO 뽑기 (프로젝트 상황에 맞춰 안전 캐스팅) */
    private LoginUserDTO currentLoginUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        // 1) 이미 LoginUserDTO가 principal인 경우
        if (principal instanceof LoginUserDTO dto) return dto;

        // 2) 커스텀 유저 클래스 사용하는 경우 (이름만 맞춰서 가져오기)
        // 예: com.hongik.books.security.oauth.CustomOAuth2User 에 id() / getId() 가 있을 수 있음
        try {
            Long id = null;
            try { id = (Long) principal.getClass().getMethod("getId").invoke(principal); } catch (NoSuchMethodException ignored) {}
            if (id == null) { try { id = (Long) principal.getClass().getMethod("id").invoke(principal); } catch (NoSuchMethodException ignored) {} }
            String username = null;
            try { username = (String) principal.getClass().getMethod("getUsername").invoke(principal); } catch (NoSuchMethodException ignored) {}
            if (username == null) { try { username = (String) principal.getClass().getMethod("getName").invoke(principal); } catch (NoSuchMethodException ignored) {} }
            String email = null;
            try { email = (String) principal.getClass().getMethod("getEmail").invoke(principal); } catch (NoSuchMethodException ignored) {}

            if (id != null) {
                return new LoginUserDTO(id, email);
            }
        } catch (Exception ignored) {}

        // 3) 마지막으로 Authentication#getName()만이라도 담아둔다(아이디는 Service에서 다시 조회할 수 있음)
        return null; // id가 없으면 Service에서 401 처리
    }
}
