package com.hongik.books.security.oauth;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Getter
public class CustomOAuth2User implements OAuth2User {
    private final OAuth2User oAuth2User;
    private final String socialType;
    private final String id;
    private final String name;
    private final String email;

    public CustomOAuth2User(OAuth2User oAuth2User, String socialType) {
        if (oAuth2User == null) {
            throw new IllegalArgumentException("OAuth2User cannot be null");
        }
        if (socialType == null || socialType.trim().isEmpty()) {
            throw new IllegalArgumentException("Social type cannot be null or empty");
        }

        this.oAuth2User = oAuth2User;
        this.socialType = socialType.toLowerCase(); // 대소문자 통일
        this.id = extractId(oAuth2User, this.socialType);
        this.name = extractName(oAuth2User, this.socialType);
        this.email = extractEmail(oAuth2User, this.socialType);
    }

    private String extractId(OAuth2User oAuth2User, String socialType) {
        try {
            switch (socialType) {
                case "google":
                    return oAuth2User.getAttribute("sub");
                case "kakao":
                    Object id = oAuth2User.getAttribute("id");
                    return id != null ? id.toString() : null;
                case "naver":
                    return extractFromNaverResponse("id", oAuth2User);
                default:
                    throw new IllegalArgumentException("Unsupported social type: " + socialType);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract ID for social type: " + socialType, e);
        }
    }


    private String extractName(OAuth2User oAuth2User, String socialType) {
        try {
            switch (socialType) {
                case "google":
                    return oAuth2User.getAttribute("name");
                case "kakao":
                    return extractFromKakaoProfile("nickname", oAuth2User);
                case "naver":
                    return extractFromNaverResponse("name", oAuth2User);
                default:
                    throw new IllegalArgumentException("Unsupported social type: " + socialType);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract name for social type: " + socialType, e);
        }
    }

    private String extractEmail(OAuth2User oAuth2User, String socialType) {
        try {
            switch (socialType) {
                case "google":
                    return oAuth2User.getAttribute("email");
                case "kakao":
                    return extractFromKakaoAccount("email", oAuth2User);
                case "naver":
                    return extractFromNaverResponse("email", oAuth2User);
                default:
                    throw new IllegalArgumentException("Unsupported social type: " + socialType);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract email for social type: " + socialType, e);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractFromKakaoProfile(String key, OAuth2User oAuth2User) {
        Map<String, Object> account = oAuth2User.getAttribute("kakao_account");
        if (account == null) {
            return null;
        }

        Map<String, Object> profile = (Map<String, Object>) account.get("profile");
        if (profile == null) {
            return null;
        }

        return (String) profile.get(key);
    }

    @SuppressWarnings("unchecked")
    private String extractFromKakaoAccount(String key, OAuth2User oAuth2User) {
        Map<String, Object> account = oAuth2User.getAttribute("kakao_account");
        if (account == null) {
            return null;
        }

        return (String) account.get(key);
    }

    @SuppressWarnings("unchecked")
    private String extractFromNaverResponse(String key, OAuth2User oAuth2User) {
        Map<String, Object> response = oAuth2User.getAttribute("response");
        if (response == null) {
            return null;
        }

        return (String) response.get(key);
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oAuth2User.getAttributes();
    }

    @Override
    public <T> T getAttribute(String name) {
        return oAuth2User.getAttribute(name);
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 불변 빈 컬렉션 반환
        return Collections.emptySet();
    }

    // toString, equals, hashCode 메서드 추가 (디버깅 및 테스트에 유용)
    @Override
    public String toString() {
        return "CustomOAuth2User{" +
                "socialType='" + socialType + '\'' +
                ", id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
