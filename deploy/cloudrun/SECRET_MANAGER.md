# Cloud Run과 Secret Manager
Secret Manager는 버전 관리와 IAM 제어가 가능한 민감 정보 저장소.

## 비용 (Always Free 구간)
- 청구 계정 기준 월 6개의 활성 버전과 10,000건의 접근 호출이 무료.
- 초과분은 대략 버전당 월 0.06달러, 호출 1만 건당 0.03달러 수준이지만, 최신 요금은 공식 문서를 확인.

## 빠른 시작
1. **API 활성화** 
    ```bash
    gcloud services enable secretmanager.googleapis.com --project $PROJECT_ID
    ```
   
2. **런타임 서비스 계정 선택** (권장)
    ```bash
    SERVICE_ACCOUNT=cr-hongbook@$PROJECT_ID.iam.gserviceaccount.com
    ```
   권한 부여:
   ```bash
    gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member serviceAccount:$SERVICE_ACCOUNT \
    --role roles/secretmanager.secretAccessor
   ```
3. **시크릿 생성 및 버전 추가**
   - 수동으로 생성
   ```bash
    gcloud secrets create MYSQL_PASSWORD --project $PROJECT_ID --replication-policy=automatic
    printf 'your_password' | gcloud secrets versions add MYSQL_PASSWORD --project $PROJECT_ID --data-file=-
   ```
   - 배포 스크립트 활용
     ```bash
        ./deploy/cloudrun/deploy.sh \
        --bootstrap-secrets --use-secrets \
        --env-file ./deploy/cloudrun/.env.sample \
        --service-account $SERVICE_ACCOUNT
     ```
     
4. **배포 시 시크릿 매핑**
   - `deploy.sh`는 `deploy/cloudrun/secrets.list`를 읽어 `--set-secrets KEY=projects/$PROJECT_ID/secrets/KEY:latest` 옵션을 추가.
   - Spring 애플리케이션은 일반 환경변수(`MYSQL_PASSWORD` 등)처럼 값을 참조.

## 운영 팁
- 동일한 키를 `--set-env-vars`와 `--set-secrets`에 동시에 지정 금지. 스크립트는 `secrets.list`에 있는 키를 `.env`에서 자동으로 제외.
- DB 비밀번호 등 민감 값은 시크릿으로 관리하고, 호스트/포트/DB명은 일반 환경변수로 두어도 OK.
- 운영 배포에서는 `ALLOWED_ORIGINS`를 실제 도메인으로 명시.
- 실제 시크릿 값이 들어 있는 `.env`는 절대 커밋하지 말고, 이미 `.gitignore`와 `.dockerignore`에 의해 제외되어 있으니 그대로 유지.
