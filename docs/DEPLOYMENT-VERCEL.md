# HongBookStore 프론트 Vercel 배포 가이드 (워커 제거)

이 가이드는 프론트엔드를 Vercel에 배포하고, Vercel Serverless Function으로 `/api/*` 요청을 백엔드(GCE)로 프록시하는 설정을 설명합니다. Cloudflare Workers는 사용하지 않습니다.

## 1) Vercel 프로젝트 생성
- New Project → Import Git Repo
- Root Directory: `src/main/frontend`
- Framework Preset: Other (또는 자동 인식)
- Build Command: `npm run build`
- Output Directory: `dist`

## 2) 환경변수 설정 (Vercel → Project → Settings → Environment Variables)
프런트/함수 공통
- `VITE_API_BASE` = `/api` (프런트는 항상 같은 오리진의 `/api`를 호출)

서버리스 함수용
- `BACKEND_ORIGIN` = `http://<GCE_IP>:8080` (백엔드 오리진)
- `EDGE_SHARED_SECRET` = `<임의 강한 토큰>` (선택, 백엔드에서 검증 시 사용)

지도 등 클라이언트용 키(선택)
- `VITE_NAVER_MAP_CLIENT_ID`
- `VITE_NAVER_MAP_CLIENT_SECRET`

## 3) 프록시 동작
- `src/main/frontend/api/[...path].js` 함수가 `/api/*`로 들어온 모든 요청을 `BACKEND_ORIGIN`으로 그대로 전달합니다.
- Authorization/Cookie 등 헤더를 그대로 전달하고, `EDGE_SHARED_SECRET`이 있으면 `x-edge-key` 헤더를 추가합니다.

## 4) OAuth 리다이렉트
- 백엔드가 소셜 로그인 성공 시 프론트의 `/oauth/callback`으로 리다이렉트합니다.
- 서버 환경변수로 `APP_FRONTEND_BASE_URL`을 VM에 설정하세요. 예:
  - `APP_FRONTEND_BASE_URL=https://<your-project>.vercel.app`

## 5) 로컬 개발 팁
- 기본값은 `/api` 이므로 Vite dev 서버에서 프록시가 없다면 API가 404가 날 수 있습니다.
- 개발 시 `.env`에 `VITE_API_BASE=http://localhost:8080/api`를 지정하거나 Vite 프록시 설정을 추가하세요.

## 6) GitHub Actions
- `.github/workflows/frontend-pages.yml` (Cloudflare Pages 용)은 더 이상 사용하지 않습니다. 혼선을 피하려면 비활성화/삭제하세요.

