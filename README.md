# Moodly — backend (v0.1)

Free, public single-page coffee-mood recipe tool. This is the Strapi v5
(TypeScript) + PostgreSQL backend: content model, Docker Compose, and CI.
See `/docs` (Charter, PRD, Design Document, etc.) for the full project
record.

**Scope of this v0.1 slice:** D-1 (content model, Postgres, Docker Compose)
and basic CI (B-01 to B-05). The frontend (browsing UI, B-06 to B-11) and
the SipSense matching function (v0.2) come next.

## Content model

| Type | Purpose |
|---|---|
| `Tag` | One value in a matching dimension (mood, flavor, caffeine, temperature, time, difficulty). ADR-001. |
| `Recipe` | A coffee recipe, own or imported, tagged for matching. |
| `Question` / `Answer` | The SipSense quiz, editable in the admin without a redeploy. Each answer maps to tags. ADR-002. |
| `RecipeSuggestion` | Visitor-submitted recipe, no login. Public create-only; forced to `status: new`. ADR-006. |
| `Comment` | Visitor experience comment, no login. Public create-only; forced to `status: pending`; only the latest 6 approved show. ADR-006. |

Full field list: PRD §5 and `docs/Moodly_Design_Document.docx`.

## Run it locally

```bash
cp .env.example .env
# generate real secrets, e.g.:
#   node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
# and fill in APP_KEYS / API_TOKEN_SALT / ADMIN_JWT_SECRET / TRANSFER_TOKEN_SALT / ENCRYPTION_KEY / JWT_SECRET

docker compose up
```

Strapi admin: http://localhost:1337/admin (create your first admin user on
first run). REST API: http://localhost:1337/api.

Seed tags, the quiz, and starter recipes (safe to re-run):

```bash
docker compose exec backend npm run seed
```

## Backend commands

```bash
cd backend
npm run lint        # eslint
npm run typecheck    # tsc --noEmit
npm test             # jest
npm run seed          # scripts/seed.ts
```

## CI/CD

`.github/workflows/ci.yml` runs lint, typecheck, and test against a
Postgres service container on every push and PR to `main` (B-05). CD
(build + deploy on a version tag) is added at v1.0.

## Security note (ADR-006)

The public API role is set on every boot by `backend/src/index.ts`
(`bootstrap`), not by hand in the admin panel — so it can't be silently
missed on a fresh clone or a new environment. Public visitors can read
recipes/tags/questions/answers and create suggestions/comments; they can
never read, update, delete, or choose their own `status`.
