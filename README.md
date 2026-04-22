# LP_Admin

Desktop admin UI (Next.js) for Lonely Planet.

## Backend

This app talks to `LP_Services` (FastAPI) over HTTP. **No DB connections** exist in this project.

By default it points to:

- `http://localhost:8787`

Configure via:

- `.env.local` → `NEXT_PUBLIC_API_BASE`

Example:

```bash
cp .env.local.example .env.local
```

## Run

```bash
yarn install
yarn dev
```

- Admin UI: `http://localhost:3001`
- Backend: `http://localhost:8787`

## Required database migrations (LP_Services)

Admin features depend on DB schema migrations in `LP_Services/db/migrations/`.

If a migration is missing, the backend will respond with a helpful error message (e.g. “missing migration …”).

Core personas + versions CRUD expects:

- `001_add_persona_version_label.sql` (draft labels)
- `002_add_persona_discovery_fields.sql` (bio / viewersLabel / isOnline etc.)
- `003_persona_version_avatar.sql` (avatarUrl + upload/publish requirement)
- `006_move_persona_card_fields_to_versions.sql` (card fields moved to versions)
- `008_add_persona_visible.sql` (persona visibility toggle)

## Auth (dev mode)

Matches the mobile flow:

- `POST /auth/otp/request`
- `POST /auth/otp/verify` (dev accepts any 6-digit OTP)

Token is stored in `localStorage` under `lp.sessionToken`.

## Smoke test checklist

- `LP_Services` running on `:8787`
- `LP_Admin` running on `:3001`
- Login (`/login`) → redirected to `/admin`
- Personas list row → `/admin/personas/:id`
- New persona → redirects to `/admin/versions/:versionId`
- Draft autosaves (every ~5s) and manual Save works
- Upload avatar → Publish works
- Delete draft returns to persona page (or back)
