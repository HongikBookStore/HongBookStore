package com.hongik.books.domain.place.controller;

import com.hongik.books.domain.place.dto.PlaceDto;
import com.hongik.books.domain.place.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    // 🔍 네이버 장소 검색
    @GetMapping("/search")
    public ResponseEntity<String> searchPlaces(@RequestParam String query) {
        String resultJson = placeService.searchPlaces(query);
        return ResponseEntity.ok(resultJson); // 반드시 JSON 형식 문자열이어야 함
    }

    // 📦 DB에서 저장된 장소 전부 조회
    @GetMapping
    public ResponseEntity<List<PlaceDto.Response>> getAllPlaces() {
        return ResponseEntity.ok(placeService.getAllPlaces());
    }

    // ➕ 새로운 장소 DB 저장
    @PostMapping
    public ResponseEntity<PlaceDto.Response> savePlace(@RequestBody PlaceDto.SaveRequest request) {
        PlaceDto.Response saved = placeService.savePlace(request);
        return ResponseEntity.ok(saved);
    }
}

