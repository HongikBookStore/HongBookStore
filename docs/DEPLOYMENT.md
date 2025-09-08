# HongBookStore 배포 가이드 (무도메인/저비용)

이 문서는 도메인을 구매하지 않는 전제로, Cloudflare Pages/Workers와 GCP(GCE, GCS, Cloud Run)를 결합해 비용을 최소화하면서 운영 가능한 배포 방식을 정리합니다.

- 백엔드: Spring Boot 3.5 (Java 21)
- DB: MySQL/Redis on GCE(도커)
- 이미지: GCP Cloud Storage(GCS)
- 욕설/유해성 필터: Cloud Run(Flask)
- 프론트엔드: React(Vite) `src/main/frontend`

---

## 0. 도메인 구매 여부

- 미구매 운영 가능: 프론트는 `*.pages.dev`, API 프록시는 `*.workers.dev`를 사용합니다. OAuth 리다이렉트도 해당 도메인으로 등록 가능합니다.
- 한계: 백엔드를 안정적으로 노출하려면 보통 커스텀 도메인이 유리합니다. 무도메인에서는 다음 두 가지 중 하나를 선택합니다.
  1) GCE 백엔드에 공인 IP/포트를 개방하고, Cloudflare Worker가 프록시(권장: 백엔드에 공유 시크릿 헤더 검사 추가).
  2) Cloudflare Quick Tunnel(`*.trycloudflare.com`)을 사용해 백엔드를 노출(간편하나 URL 안정성/운영성은 떨어짐).

장기적으로는 커스텀 도메인 사용이 안정성과 보안 면에서 유리합니다.

---

## 1. 아키텍처 개요(무도메인)

- 프론트: Cloudflare Pages(`*.pages.dev`)가 정적 파일 서빙.
- API: Cloudflare Worker(`*.workers.dev`)가 백엔드(GCE VM)로 프록시 + 캐싱 + CORS 처리.
- 백엔드: GCE VM에서 Spring Boot 실행. 외부에는 Worker만 호출하도록 시크릿 헤더 검증을 추가 권장.
- 이미지: GCS 퍼블릭 객체 URL을 직접 사용하고, Browser/Edge 캐시 헤더로 트래픽 최소화.
- Toxic Filter: Cloud Run URL 유지(백엔드→Cloud Run), 공유 시크릿 헤더로 접근 제한.

---

## 2. 준비물

- Cloudflare 계정(Free), GCP 프로젝트(GCE, GCS, Cloud Run 사용 중)
- GCE VM 도구: `docker`, `docker compose`, Java 21 또는 Docker 런타임
- 로컬/CI: Node 18+, npm, Wrangler(`npm i -g wrangler`), GitHub Actions

---

## 3. 시크릿/환경변수

- 레포 내 `.env`는 제거/회수하고 새 키로 로테이트하세요. 운영 시 시크릿은 GitHub Secrets, GCE VM 환경파일, Secret Manager 등에 보관합니다.
- Spring 환경변수(예):
  - `SPRING_PROFILES_ACTIVE=prod`
  - `SPRING_DATASOURCE_URL=jdbc:mysql://<db-host>:3306/hongBookstore?...`
  - `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
  - `SPRING_DATA_REDIS_HOST`, `SPRING_DATA_REDIS_PORT=6379`
  - `GCP_PROJECT_ID`, `GCP_BUCKET_NAME`
  - 외부 API/메일/JWT/OAuth/Toxic Filter 키들
- 권장: `application.yml`의 고정 IP를 `${...}` 플레이스홀더로 전환해 환경변수로 오버라이드.

---

## 4. DB(MySQL/Redis) 운영 팁

- 3306/6379는 가능하면 외부 비공개(동일 VM/내부 네트워크로만 접근).
- 정기 백업(MySQL dump→GCS), 디스크 모니터링, 재해복구 리허설 권장.

---

## 5. 백엔드 실행(서비스)

1) 빌드: `./gradlew clean bootJar`
2) 환경파일(`/etc/hongbook.env`)에 운영 변수 정의
3) systemd 유닛으로 실행/재시작 관리(`/etc/systemd/system/hongbook.service`)

예시는 GitHub Actions 섹션의 백엔드 배포 파이프라인에서 자동화됩니다.

---

## 6. 프론트(Cloudflare Pages)

- 빌드 명령: `npm ci && npm run build`
- 산출물: `src/main/frontend/dist`
- API 베이스: `VITE_API_BASE=https://<workers-서브도메인>.workers.dev`
- GitHub Actions로 자동 배포(아래 참조). Pages 기본 도메인(`*.pages.dev`)이 부여됩니다.

---

## 7. Cloudflare Worker(API 프록시/캐시)

- 엔드포인트: `https://<worker-name>.<계정>.workers.dev`
- 역할: 프론트→워커→백엔드(GCE)로 라우팅, 공개 GET 캐싱, CORS 통합, 공유 시크릿 헤더 첨부
- 보안: 백엔드는 공유 시크릿 헤더 없는 요청을 거부하는 필터를 두는 것을 권장합니다.

구현 파일(레포 포함): `cf/worker/worker.js`, `cf/worker/wrangler.toml`

---

## 8. GCS 이미지

- 공개 객체는 `Cache-Control: public, max-age=2592000, immutable` 권장.
- 민감/권한 필요한 경우: 서명 URL 사용, 캐시 단기화.

---

## 9. OAuth/CORS

- OAuth 리다이렉트 URI: `https://<pages-프로젝트>.pages.dev/...` 또는 워커 도메인 기반으로 등록.
- Spring CORS 허용: Pages 도메인(`*.pages.dev`)과 워커 도메인(`*.workers.dev`).

---

## 10. GitHub Actions(CI/CD)

### 10.1 백엔드(GCE VM 배포)

- 트리거: `main` 브랜치에 백엔드 변경사항 푸시 시
- 동작: Gradle 빌드 → 산출물 `app.jar` 복사(`/opt/hongbook/app.jar`) → systemd 재시작
- 필요 Secrets:
  - `GCE_HOST`(VM 공인 IP), `GCE_USER`(예: ubuntu), `GCE_SSH_KEY`(개인키 PEM)
  - `SERVICE_NAME`(예: hongbook)

워크플로 파일: `.github/workflows/backend-deploy.yml`

### 10.2 프론트(Cloudflare Pages 배포)

- 트리거: 프론트 폴더 변경 시
- 동작: Vite 빌드 → Wrangler로 Pages 배포
- 필요 Secrets:
  - `CF_API_TOKEN`(Pages 권한 포함), `CF_ACCOUNT_ID`, `CF_PAGES_PROJECT`
  - `VITE_API_BASE`(워커 도메인)

워크플로 파일: `.github/workflows/frontend-pages.yml`

### 10.3 워커(Workers 배포)

- 트리거: `cf/worker/**` 변경 시
- 동작: Wrangler로 워커 배포(출력: `*.workers.dev`)
- 필요 Secrets:
  - `CF_API_TOKEN`(Workers 권한), `CF_ACCOUNT_ID`
  - `BACKEND_ORIGIN`(예: `http://<GCE_IP>:8080`), `EDGE_SHARED_SECRET`(워커→백엔드 헤더 값)

워크플로 파일: `.github/workflows/worker-deploy.yml`

---

## 11. 운영 체크리스트

- 시크릿 로테이션 및 저장소에서 제거
- Spring Actuator 헬스체크, 로깅 레벨 운영화
- DB 마이그레이션 도구(Flyway) 도입 검토
- 백엔드 방화벽: 가능하면 제한(IP 화이트리스트). 최소한 공유 시크릿 헤더 검증 필수

---

## 12. 트러블슈팅

- CORS 오류: 프론트 Origin과 워커 응답 헤더 원인 비교
- OAuth 콜백 불일치: 제공자 콘솔의 리다이렉트 URI가 정확히 일치해야 함
- 워커 캐시 미적용: Authorization 포함 시 캐시 우회, 공개 GET만 캐시됨

