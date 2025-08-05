package com.hongik.books.config;

import com.hongik.books.common.service.MockDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * 개발 환경에서 서버 실행 시 Mock 데이터를 자동으로 DB에 주입하는 클래스
 */
@Configuration
@Profile("dev") // 'dev' 프로필이 활성화될 때만 이 설정이 동작
@RequiredArgsConstructor
public class DataInitializer {
    private final MockDataService mockDataService;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // 별도의 서비스 Bean에 있는 메서드를 호출하여 트랜잭션 적용
            mockDataService.createMockData();
        };
    }
}
