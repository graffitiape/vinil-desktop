# Vinil Azure Dev Environment

This repo is wired to the Vinil Azure dev backend.

## Current Dev Resources

- Resource group: `vinil-rg`
- Region: `italynorth`
- API: `https://vinil-dev-api-176276.azurewebsites.net/api`
- App Service: `vinil-dev-api-176276`
- App Service plan: `vinil-dev-plan`
- ACR: `vinildev176276acr`
- Backend image: `vinildev176276acr.azurecr.io/vinil-backend:dev-20260707-1157`
- PostgreSQL Flexible Server: `vinil-dev-pg-176276`
- PostgreSQL database: `vinil`
- Storage account: `vinildev176276`
- Blob container: `audio`

Secrets are stored in Azure App Service app settings, not in this repository.

## Desktop Configuration

`/Users/vasjondone/vinil-desktop/.env.local` points the desktop app at Azure:

```env
VITE_API_BASE_URL=https://vinil-dev-api-176276.azurewebsites.net/api
```

Run the frontend:

```bash
npm run dev
```

The local Vite dev server uses `http://127.0.0.1:5175`.

Run the Tauri desktop app:

```bash
npm run tauri:dev
```

## Backend Configuration

Backend source lives in `/Users/vasjondone/vinil-backend`.

Required App Service settings:

```env
DATABASE_URL=postgresql://<user>:<password>@vinil-dev-pg-176276.postgres.database.azure.com:5432/vinil?sslmode=require
JWT_SECRET=<strong-secret>
AZURE_STORAGE_ACCOUNT=vinildev176276
AZURE_STORAGE_ACCESS_KEY=<storage-key>
AZURE_STORAGE_CONTAINER=audio
WEBSITES_PORT=8080
PORT=8080
RUST_LOG=info
```

The backend runs SQLx migrations on startup. The initial migration avoids Azure-blocked extension creation and relies on PostgreSQL 16 `gen_random_uuid()`.

## Deploy Backend

From this repo, build and push a new backend image:

```bash
az acr build \
  --registry vinildev176276acr \
  --image vinil-backend:<tag> \
  /Users/vasjondone/vinil-backend
```

Point App Service at the new image:

```bash
az webapp config container set \
  --resource-group vinil-rg \
  --name vinil-dev-api-176276 \
  --docker-custom-image-name vinildev176276acr.azurecr.io/vinil-backend:<tag> \
  --docker-registry-server-url https://vinildev176276acr.azurecr.io

az webapp restart \
  --resource-group vinil-rg \
  --name vinil-dev-api-176276
```

## Verify

Health:

```bash
curl https://vinil-dev-api-176276.azurewebsites.net/api/health
```

Expected:

```json
{"status":"ok"}
```

End-to-end smoke verified on 07/07/2026:

- Register user through `/api/auth/register`
- Create album through `/api/albums`
- Upload WAV through `/api/upload`
- Confirm Blob Storage receives an `audio/wav` object
- Stream the track through `/api/tracks/{id}/stream?token=...`
