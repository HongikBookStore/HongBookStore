Secret Manager with Cloud Run
================================

What it is
- Managed storage for sensitive config (passwords, API keys) with versioning and IAM control.

Costs (Always Free)
- Per billing account each month: 6 active versions free, 10,000 access operations free. Beyond that: ~$0.06/version/month, ~$0.03 per 10k accesses. Check official pricing for updates.

Quick Start
1) Enable API
   - `gcloud services enable secretmanager.googleapis.com --project $PROJECT_ID`

2) Choose runtime service account (optional but recommended)
   - Create or reuse: `SERVICE_ACCOUNT=cr-hongbook@${PROJECT_ID}.iam.gserviceaccount.com`
   - Grant accessor: `gcloud projects add-iam-policy-binding $PROJECT_ID --member serviceAccount:${SERVICE_ACCOUNT} --role roles/secretmanager.secretAccessor`

3) Create secrets and add versions
   - Either manually:
     - `gcloud secrets create MYSQL_PASSWORD --replication-policy=automatic --project $PROJECT_ID`
     - `printf 'your_password' | gcloud secrets versions add MYSQL_PASSWORD --data-file=- --project $PROJECT_ID`
   - Or use our deploy helper to bootstrap from an `.env` file:
     - `./deploy/cloudrun/deploy.sh --bootstrap-secrets --use-secrets --env-file ./deploy/cloudrun/.env.sample --service-account ${SERVICE_ACCOUNT}`

4) Deploy with secrets mapped to env vars
   - The script reads `deploy/cloudrun/secrets.list` and passes `--set-secrets VAR=projects/$PROJECT_ID/secrets/VAR:latest` for each line.
   - App reads them as normal env vars (e.g., `MYSQL_PASSWORD`).

Script examples
- Minimal with secrets, unauthenticated:
  `PROJECT_ID=your-project REGION=us-west1 REPOSITORY=containers ./deploy/cloudrun/deploy.sh --use-secrets --allow-unauthenticated`

- Bootstrap secrets from `.env` and deploy with dedicated SA:
  `PROJECT_ID=your-project REGION=us-west1 REPOSITORY=containers ./deploy/cloudrun/deploy.sh --bootstrap-secrets --use-secrets --env-file ./deploy/cloudrun/.env.sample --service-account cr-hongbook@your-project.iam.gserviceaccount.com`

Notes
- Avoid mixing `--set-env-vars` and `--set-secrets` for the same KEY. The script automatically excludes keys listed in `secrets.list` from `--env-file` injection.
- For DB credentials, prefer storing only the password as secret; host/port/name can stay as regular env vars.
- In prod, set `ALLOWED_ORIGINS` via env var to your exact domains. There is no default in prod profile.

