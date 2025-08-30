package com.hongik.books.domain.chat.service;

import com.hongik.books.auth.dto.LoginUserDTO;
import com.hongik.books.domain.chat.domain.ChatReservation;
import com.hongik.books.domain.chat.domain.ChatReservationStatus;
import com.hongik.books.domain.chat.domain.ChatRoom;
import com.hongik.books.domain.chat.dto.ChatReservationRequest;
import com.hongik.books.domain.chat.dto.ChatReservationResponse;
import com.hongik.books.domain.chat.repository.ChatReservationRepository;
import com.hongik.books.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatReservationService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatReservationRepository reservationRepository;

    private static LocalDateTime parseDateTime(String s) {
        if (s == null || s.isBlank()) throw new IllegalArgumentException("예약 시간은 필수입니다.");
        try { return OffsetDateTime.parse(s).toLocalDateTime(); }
        catch (Exception e) { return LocalDateTime.parse(s); }
    }

    private static ChatReservationResponse toDto(ChatReservation r) {
        return ChatReservationResponse.builder()
                .id(r.getId())
                .chatRoomId(r.getChatRoom().getId())
                .status(r.getStatus().name())
                .reservedAt(r.getReservedAt() != null ? r.getReservedAt().toString() : null)
                .meetType(r.getMeetType())
                .placeLabel(r.getPlaceLabel())
                .oncampusPlaceCode(r.getOncampusPlaceCode())
                .offcampusStationCode(r.getOffcampusStationCode())
                .createdByUserId(r.getCreatedByUserId())
                .cancelReason(r.getCancelReason())
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                .updatedAt(r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public ChatReservationResponse getLatest(Long roomId) {
        return reservationRepository.findTopByChatRoomIdOrderByIdDesc(roomId)
                .map(ChatReservationService::toDto)
                .orElse(null);
    }

    @Transactional
    public ChatReservationResponse upsert(Long roomId, LoginUserDTO user, ChatReservationRequest req) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방"));

        Long uid = user.id();
        if (!uid.equals(room.getBuyer().getId()) && !uid.equals(room.getSeller().getId())) {
            throw new IllegalArgumentException("채팅방 참가자만 예약할 수 있습니다.");
        }

        var activeStatuses = List.of(ChatReservationStatus.CONFIRMED);
        ChatReservation r = reservationRepository
                .findTopByChatRoomIdAndStatusInOrderByIdDesc(roomId, activeStatuses)
                .orElse(ChatReservation.builder()
                        .chatRoom(room)
                        .status(ChatReservationStatus.CONFIRMED)
                        .createdByUserId(uid)
                        .build()
                );

        r.setStatus(ChatReservationStatus.CONFIRMED);
        r.setMeetType(req.meetType());
        r.setPlaceLabel(req.placeLabel());
        r.setOncampusPlaceCode(req.oncampusPlaceCode());
        r.setOffcampusStationCode(req.offcampusStationCode());
        r.setReservedAt(parseDateTime(req.reservedAt()));
        r.setCancelReason(null);

        return toDto(reservationRepository.save(r));
    }

    @Transactional
    public ChatReservationResponse cancel(Long roomId, Long reservationId, LoginUserDTO user, String reason) {
        ChatReservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        if (!r.getChatRoom().getId().equals(roomId)) throw new IllegalArgumentException("채팅방이 일치하지 않습니다.");

        Long uid = user.id();
        ChatRoom room = r.getChatRoom();
        if (!uid.equals(room.getBuyer().getId()) && !uid.equals(room.getSeller().getId())) {
            throw new IllegalArgumentException("채팅방 참가자만 취소할 수 있습니다.");
        }

        r.setStatus(ChatReservationStatus.CANCELED);
        r.setCancelReason(reason);
        return toDto(r);
    }

    @Transactional
    public ChatReservationResponse complete(Long roomId, Long reservationId, LoginUserDTO user) {
        ChatReservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        if (!r.getChatRoom().getId().equals(roomId)) throw new IllegalArgumentException("채팅방이 일치하지 않습니다.");

        Long uid = user.id();
        ChatRoom room = r.getChatRoom();
        if (!uid.equals(room.getBuyer().getId()) && !uid.equals(room.getSeller().getId())) {
            throw new IllegalArgumentException("채팅방 참가자만 완료할 수 있습니다.");
        }

        r.setStatus(ChatReservationStatus.COMPLETED);
        r.setCancelReason(null);
        return toDto(r);
    }
}
