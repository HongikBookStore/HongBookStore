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
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class PlaceService {

    // Naver Local Search (openapi.naver.com)
    @Value("${naver.place.api.key.id}")
    private String clientId;

    @Value("${naver.place.api.secret}")
    private String clientSecret;

    // Naver Map Geocode/Reverse Geocode (apigw.ntruss.com)
    @Value("${naver.api.client-id}")
    private String routeClientId;

    @Value("${naver.api.client-secret}")
    private String routeClientSecret;

    private final RestTemplate restTemplate;
    private final PlaceRepository placeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

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

    // 🗺️ 4. 좌표를 도로명 주소로 변환
    public Map<String, String> getAddressFromCoordinates(double lat, double lng) {
        String coords = lng + "," + lat; // 네이버 API는 "경도,위도" 형식
        
        String apiUrl = "https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc";
        
        URI uri = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("coords", coords)
                .queryParam("sourcecrs", "epsg:4326")
                .queryParam("targetcrs", "epsg:4326")
                .queryParam("orders", "roadaddr")
                .queryParam("output", "json")
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-NCP-APIGW-API-KEY-ID", routeClientId);
        headers.set("X-NCP-APIGW-API-KEY", routeClientSecret);
        headers.set("Content-Type", "application/json");

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    request,
                    String.class
            );
            
            // JSON 응답을 파싱하여 주소 정보 추출
            String responseBody = response.getBody();
            if (responseBody != null && responseBody.contains("\"status\":{\"code\":0")) {
                // 성공적인 응답인 경우 주소 정보 추출
                Map<String, String> addressData = new HashMap<>();
                
                // 간단한 파싱 (실제로는 JSON 파서 사용 권장)
                if (responseBody.contains("\"roadAddress\":")) {
                    String roadAddress = extractJsonValue(responseBody, "roadAddress");
                    addressData.put("address", roadAddress);
                } else if (responseBody.contains("\"jibunAddress\":")) {
                    String jibunAddress = extractJsonValue(responseBody, "jibunAddress");
                    addressData.put("address", jibunAddress);
                }
                
                // 상세 주소 정보
                if (responseBody.contains("\"buildingName\":")) {
                    String buildingName = extractJsonValue(responseBody, "buildingName");
                    addressData.put("detailedAddress", buildingName);
                }
                
                return addressData;
            } else {
                // 실패한 경우 기본 좌표 반환
                Map<String, String> fallback = new HashMap<>();
                fallback.put("address", String.format("위도: %.6f, 경도: %.6f", lat, lng));
                return fallback;
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            // 오류 발생 시 기본 좌표 반환
            Map<String, String> fallback = new HashMap<>();
            fallback.put("address", String.format("위도: %.6f, 경도: %.6f", lat, lng));
            return fallback;
        }
    }

    // 🧭 5. 주소(쿼리)로 좌표 조회 (Forward Geocoding)
    public Map<String, Object> forwardGeocode(String query) {
        String apiUrl = "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode";

        URI uri = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("query", query)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-NCP-APIGW-API-KEY-ID", routeClientId);
        headers.set("X-NCP-APIGW-API-KEY", routeClientSecret);
        headers.set("Content-Type", "application/json");

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    request,
                    String.class
            );

            String body = response.getBody();
            Map<String, Object> result = new HashMap<>();
            if (body != null) {
                JsonNode root = objectMapper.readTree(body);
                JsonNode arr = root.path("addresses");
                if (arr.isArray() && arr.size() > 0) {
                    JsonNode a = arr.get(0);
                    String x = a.path("x").asText(null); // 경도
                    String y = a.path("y").asText(null); // 위도
                    String roadAddr = a.path("roadAddress").asText("");
                    String jibunAddr = a.path("jibunAddress").asText("");
                    if (x != null && y != null) {
                        result.put("lng", Double.parseDouble(x));
                        result.put("lat", Double.parseDouble(y));
                    }
                    result.put("address", !roadAddr.isEmpty() ? roadAddr : jibunAddr);
                    return result;
                }
            }
            // 실패/무결과 폴백
            result.put("address", query);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("address", query);
            return fallback;
        }
    }

    // JSON 응답에서 특정 필드 값을 추출하는 헬퍼 메서드
    private String extractJsonValue(String json, String fieldName) {
        String pattern = "\"" + fieldName + "\":\"";
        int startIndex = json.indexOf(pattern);
        if (startIndex == -1) return "";
        
        startIndex += pattern.length();
        int endIndex = json.indexOf("\"", startIndex);
        if (endIndex == -1) return "";
        
        return json.substring(startIndex, endIndex);
    }
}
