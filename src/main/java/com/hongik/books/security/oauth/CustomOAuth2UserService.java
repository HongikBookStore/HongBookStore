package com.hongik.books.security.oauth;

import com.hongik.books.security.oauth.info.OAuth2UserInfo;
import com.hongik.books.security.oauth.info.OAuth2UserInfoFactory;
import com.hongik.books.user.domain.User;
import com.hongik.books.user.domain.UserRole;
import com.hongik.books.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. 기본 OAuth2UserService를 사용하여 OAuth2User 객체를 로드합니다.
        OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);

        // 2. 현재 로그인 진행 중인 서비스를 구분합니다. (google, naver, kakao...)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // 3. OAuth2 사용자 정보에서 고유 식별자(PK)로 사용될 속성 이름을 가져옵니다.
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        // 4. OAuth2UserInfoFactory를 사용하여, 서비스에 맞는 OAuth2UserInfo 구현체를 가져옵니다.
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        // 5. UserInfo를 바탕으로 DB에서 사용자를 찾거나, 없으면 새로 생성(회원가입)하고, 그 결과를 User 객체로 받습니다.
        User user = saveOrUpdateUser(userInfo, registrationId);

        // 6. 최종적으로 우리 서비스의 User 엔티티를 담은 CustomOAuth2User 객체를 생성하여 반환합니다.
        // 이 객체가 Spring Security의 인증 객체(Authentication)에 담겨 SuccessHandler로 전달됩니다.
        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey())), // 사용자의 권한 정보
                oAuth2User.getAttributes(),
                userNameAttributeName,
                user // DB에 저장된 최종 User 엔티티
        );
    }

    private User saveOrUpdateUser(OAuth2UserInfo userInfo, String registrationId) {
        // 소셜 ID로 사용자를 찾습니다. (findByEmail보다 socialId가 더 정확할 수 있습니다)
        User user = userRepository.findBySocialId(userInfo.getId())
                // 이미 가입된 회원이면, 이름이나 프로필 사진 등이 변경되었을 수 있으므로 업데이트합니다.
                .map(entity -> entity.updateOAuthUser(userInfo.getName()))
                // 가입되지 않은 회원이면, 새로 User 엔티티를 생성합니다.
                .orElseGet(() -> createNewUser(userInfo, registrationId));

        return userRepository.save(user); // 저장 후 User 엔티티를 반환
    }

    private User createNewUser(OAuth2UserInfo userInfo, String registrationId) {
        log.info("{} ({}) 를 통해 신규 회원가입을 시작합니다.", userInfo.getEmail(), registrationId);
        return User.builder()
                .username(userInfo.getName())
                .email(userInfo.getEmail())
                .socialId(userInfo.getId())
                .socialType(registrationId)
                .socialUser(true) // 소셜 로그인 사용자임을 표시
                .role(UserRole.USER) // 기본 역할
                .password("")
                .build();
    }
}

