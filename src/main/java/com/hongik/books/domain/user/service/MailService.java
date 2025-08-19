package com.hongik.books.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.nio.charset.StandardCharsets;
import java.time.Year;
import java.util.Locale;

import static org.springframework.http.HttpHeaders.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final WebClient.Builder webClientBuilder;

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from}")
    private String from;

    @Value("${resend.base-url:https://api.resend.com}")
    private String baseUrl;

    @Value("${email.brand.name:HongBookStore}")
    private String brandName;

    @Value("${email.brand.primary-color:#2563eb}")
    private String brandPrimaryColor;

    @Value("${email.verification.expiration-hours:24}")
    private int verificationExpirationHours;

    /**
     * 지정된 이메일 주소로 메일을 발송하는 범용 메서드 (Resend 사용)
     * @param to 받는 사람 이메일 주소
     * @param subject 이메일 제목
     * @param text 이메일 본문(plain text)
     * @param html html 템플릿
     */
    public void sendEmailHtml(String to, String subject, String text, String html) {
        if (apiKey == null || apiKey.isBlank()) {
            log.error("RESEND_API_KEY is not configured; skipping email send.");
            return;
        }
        if (from == null || from.isBlank()) {
            log.error("RESEND_FROM_EMAIL is not configured; skipping email send.");
            return;
        }

        WebClient client = webClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader(AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> body = Map.of(
                "from", from,
                "to", new String[]{to},
                "subject", subject,
                "text", text,
                "html", html
        );

        try {
            client.post()
                    .uri("/emails")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(e -> {
                        log.error("Failed to send HTML email via Resend: {}", e.getMessage());
                        return Mono.empty();
                    })
                    .block();
        } catch (Exception e) {
            log.error("Resend HTML email send exception: {}", e.getMessage());
            // 이메일 발송 실패가 전체 트랜잭션을 막지 않도록 예외 전파는 하지 않음
        }
    }

    public void sendStudentVerificationEmail(String to, String username, String verificationUrl, Locale locale) {
        String lang = normalizeLang(locale);
        String subject;
        String text;
        switch (lang) {
            case "en" -> {
                subject = "[HongBookStore] Please complete your student verification.";
                text = "Click the link to complete verification: " + verificationUrl;
            }
            case "ja" -> {
                subject = "[HongBookStore] 在校生認証を完了してください。";
                text = "以下のリンクをクリックして認証を完了してください: " + verificationUrl;
            }
            case "zh" -> {
                subject = "[HongBookStore] 请完成在校生验证。";
                text = "点击以下链接完成验证：" + verificationUrl;
            }
            default -> {
                subject = "[홍북서점] 재학생 인증을 완료해주세요.";
                text = "홍북서점 재학생 인증을 완료하려면 아래 링크를 클릭하세요: " + verificationUrl;
            }
        }

        String templatePath = switch (lang) {
            case "en" -> "templates/email/verification_en.html";
            case "ja" -> "templates/email/verification_ja.html";
            case "zh" -> "templates/email/verification_zh.html";
            default -> "templates/email/verification_ko.html";
        };

        String html = renderTemplate(templatePath)
                .replace("{{USERNAME}}", escapeHtml(username))
                .replace("{{VERIFICATION_URL}}", verificationUrl)
                .replace("{{YEAR}}", String.valueOf(Year.now().getValue()))
                .replace("{{BRAND_NAME}}", escapeHtml(brandName))
                .replace("{{BRAND_COLOR}}", escapeHtml(brandPrimaryColor))
                .replace("{{EXPIRY_HOURS}}", String.valueOf(verificationExpirationHours));

        // fallback if template missing
        if (html.isBlank()) {
            html = "<p>" + text + "</p>";
        }
        sendEmailHtml(to, subject, text, html);
    }

    private String normalizeLang(Locale locale) {
        if (locale == null) return "ko";
        String l = locale.getLanguage();
        if (l.isBlank()) return "ko";
        if (l.startsWith("en")) return "en";
        if (l.startsWith("ja")) return "ja";
        if (l.startsWith("zh")) return "zh";
        return "ko";
    }

    private String renderTemplate(String classpathLocation) {
        try {
            ClassPathResource resource = new ClassPathResource(classpathLocation);
            byte[] bytes = resource.getContentAsByteArray();
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to load email template {}: {}", classpathLocation, e.getMessage());
            return "";
        }
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
