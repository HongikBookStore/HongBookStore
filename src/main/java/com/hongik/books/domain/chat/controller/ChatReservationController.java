package com.hongik.books.domain.chat.controller;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.domain.chat.dto.ChatReservationCancelRequest;
import com.hongik.books.domain.chat.dto.ChatReservationRequest;
import com.hongik.books.domain.chat.dto.ChatReservationResponse;
import com.hongik.books.domain.chat.service.ChatReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat/rooms/{roomId}/reservation")
@RequiredArgsConstructor
public class ChatReservationController {

    private final ChatReservationService service;

    @GetMapping
    public ResponseEntity<?> get(@PathVariable Long roomId) {
        var dto = service.getLatest(roomId);
        return dto == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<ChatReservationResponse> upsert(
            @PathVariable Long roomId,
            @AuthenticationPrincipal LoginUserDTO user,
            @RequestBody ChatReservationRequest req
    ) {
        return ResponseEntity.ok(service.upsert(roomId, user, req));
    }

    @PatchMapping("/{reservationId}/cancel")
    public ResponseEntity<ChatReservationResponse> cancel(
            @PathVariable Long roomId,
            @PathVariable Long reservationId,
            @AuthenticationPrincipal LoginUserDTO user,
            @RequestBody ChatReservationCancelRequest req
    ) {
        return ResponseEntity.ok(service.cancel(roomId, reservationId, user, req.reason()));
    }

    @PatchMapping("/{reservationId}/complete")
    public ResponseEntity<ChatReservationResponse> complete(
            @PathVariable Long roomId,
            @PathVariable Long reservationId,
            @AuthenticationPrincipal LoginUserDTO user
    ) {
        return ResponseEntity.ok(service.complete(roomId, reservationId, user));
    }
}
