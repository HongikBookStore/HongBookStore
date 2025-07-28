package com.hongik.books.domain.place.service;

import com.hongik.books.domain.place.domain.Place;
import com.hongik.books.domain.place.dto.PlaceDto;
import com.hongik.books.domain.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceService {

    @Value("${naver.place.api.key.id}")
    private String clientId;

    @Value("${naver.place.api.secret}")
    private String clientSecret;

    private final RestTemplate restTemplate;
    private final PlaceRepository placeRepository;

    // 🔍 1. 네이버 장소 검색
    public String searchPlaces(String query) {
        String apiUrl = "https://openapi.naver.com/v1/search/local.json";

        URI uri = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("query", query)
                .queryParam("display", 10)
                .queryParam("start", 1)
                .queryParam("sort", "sim")
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", clientId);
        headers.set("X-Naver-Client-Secret", clientSecret);
        headers.set("User-Agent", "Mozilla/5.0");
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    request,
                    String.class
            );
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"장소 검색 중 오류: " + e.getMessage() + "\"}";
        }
    }

    // ✅ 2. DB에서 모든 장소 조회
    @Transactional(readOnly = true)
    public List<PlaceDto.Response> getAllPlaces() {
        return placeRepository.findAll().stream()
                .map(PlaceDto.Response::new)
                .collect(Collectors.toList());
    }

    // ✅ 3. 장소 저장
    @Transactional
    public PlaceDto.Response savePlace(PlaceDto.SaveRequest request) {
        Place place = placeRepository.save(Place.builder()
                .name(request.getName())
                .category(request.getCategory())
                .address(request.getAddress())
                .description(request.getDescription())
                .lat(request.getLat())
                .lng(request.getLng())
                .build());

        return new PlaceDto.Response(place); // ✅ 이 줄이 핵심
    }
}
