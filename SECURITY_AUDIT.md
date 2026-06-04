# Security Audit - Full Codebase Hardening

**Date:** 2026-04-02  
**Repository:** CaorleFilmSnap

## Executive Summary

A full security hardening pass was applied across backend, frontend and dependency supply chain.

Main outcomes:
- ✅ Admin-only moderation endpoints (approve, reject, pending list)
- ✅ Public exposure reduced to approved photos only
- ✅ Path traversal protections on filename-based file operations
- ✅ Upload abuse protections (strict MIME allowlist + request limits + rate limits)
- ✅ Reduced information leakage in API error responses
- ✅ Dependency vulnerabilities remediated (root + frontend)

## Backend Security Changes

### 1. Authentication and Authorization
- Added `src/backend/middleware/authMiddleware.js`
- Added API-key based protection for admin endpoints (`X-Admin-Key` or `Authorization: Bearer ...`)
- Enforced admin auth on:
  - `GET /api/pending-photos`
  - `PUT /api/photos/:filename/approve`
  - `PUT /api/photos/:filename/reject`

### 2. File Operation Safety
- Added `src/backend/utils/filenameSafety.js`
- Implemented strict filename normalization and allowlist validation
- Implemented path resolution checks to prevent directory traversal

### 3. Upload Pipeline Hardening
- Updated `src/backend/middleware/uploadMiddleware.js`
  - strict MIME allowlist: JPEG, PNG, WebP, GIF
  - server-side extension mapping (not trusted from user original name)
  - tighter upload limits (`fileSize`, `files`, `parts`, `fields`)
- Updated `src/backend/routes/upload.js`
  - safer DB path initialization
  - safer per-file processing and fallback handling
  - generic error messages to clients

### 4. API and Transport Hardening
- Updated `src/backend/src/server.js`
  - removed directory listing (`serve-index` removed)
  - now publicly serves only `/uploads/approved`
  - added `helmet`
  - added `express-rate-limit` with separate policies for API, upload and admin routes
  - safer CORS allowlist logic
  - safer global error handling
  - removed duplicated insecure pending endpoint definition in server bootstrap

## Frontend Security/Resilience Changes

- Updated `src/frontend/src/App.tsx`
  - centralized API base URL (`VITE_API_BASE_URL` / fallback)
  - encoded photo filenames in generated URLs
  - added `rel="noopener noreferrer"` to external link with `target="_blank"`
- Updated `src/frontend/src/vite-env.d.ts` with typed env variables
- Updated `src/frontend/src/Policy.tsx` to remove lint/build issue

## Dependency Security Changes

### Root package
- Upgraded key runtime dependencies:
  - `express` → `^5.2.1`
  - `multer` → `^2.1.1`
  - `sqlite3` → `^6.0.1`
  - `react-router-dom` → `^7.13.2`
- Added security/runtime dependencies:
  - `helmet`, `express-rate-limit`, `dotenv`
- Added/updated overrides:
  - `tar`, `path-to-regexp`, `qs`

### Frontend package
- Upgraded:
  - `vite` → `^8.0.3`
  - `@vitejs/plugin-react` → `^6.0.1`
  - `@tailwindcss/vite` → `^4.2.2`
  - `react-router-dom` → `^7.13.2`
- Added overrides:
  - `rollup`, `picomatch`, `tar`

## Verification

Validation commands executed after changes:

1. Root dependency audit:
   - `npm audit --omit=dev --json`
   - Result: **0 vulnerabilities**

2. Frontend dependency audit:
   - `npm --prefix src/frontend audit --omit=dev --json`
   - Result: **0 vulnerabilities**

3. Frontend quality checks:
   - `npm --prefix src/frontend run build` ✅
   - `npm --prefix src/frontend run lint` ✅

4. Backend syntax checks:
   - `node --check` on modified backend files ✅

## Environment Variables Required

Configured/expected values include:
- `ADMIN_API_KEY`
- `CORS_ORIGINS`
- `MAX_UPLOAD_FILE_MB`
- `MAX_FILES_PER_REQUEST`
- `RATE_LIMIT_MAX`
- `UPLOAD_RATE_LIMIT_MAX`
- `ADMIN_RATE_LIMIT_MAX`

> Important: `ADMIN_API_KEY` must be set to a strong random value in deployment.

## Residual Operational Recommendations

1. Rotate `ADMIN_API_KEY` periodically and store it in a secrets manager.
2. Add CI gates for `npm audit --omit=dev` and frontend `npm audit --omit=dev`.
3. Add integration tests for admin moderation routes and auth failures.
4. Consider signed admin JWTs and role-based auth if multiple admin users are expected.
