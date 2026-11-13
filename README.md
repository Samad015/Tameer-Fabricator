# Tameer Fabricators

MERN rolling-shutter marketplace. The frontend follows the supplied warm ivory, taupe and charcoal reference across customer and workshop routes.

## Project layout

- `frontend/src/app/` — route composition and global providers; `main.jsx` remains the Vite entry.
- `frontend/src/features/` — catalog, quotes, dealer directory, workshop and account flows. Put feature-specific components and data together here.
- `frontend/src/components/layout/`, `shared/` and `styles/` — navigation and footer, reusable browser helpers and global styles.
- `backend/server.js` — startup and shutdown. `backend/src/app.js` composes middleware and routers; `src/routes/`, `controllers/`, `models/`, `config/`, `middleware/` and `utils/` contain their implementations.
- `backend/test/` — API regression tests. Each application keeps its own package manifest, lockfile, environment example and Dockerfile. Compose and Vercel configuration live at the root.
- `docs/design-review/` — design references and previews. `docs/archive/` — historical prototype instructions; use this README for current setup.

## Refactoring map

1. `frontend/src/styles/index.css`, `Navbar.jsx`, `Hero.jsx` and `ThemeContext.jsx`: shared material palette, serif headings, responsive navigation, shutter illustration and consistent theme. Existing customer/dealer screens inherit the palette. The screenshot is the design reference; no dark theme toggle is exposed.
2. `App.jsx`: preserve deep links on refresh, scroll to homepage anchors and provide a not-found page.
3. `backend/src/routes/authRoutes.js`, `controllers/authController.js`, `middleware/verifyToken.js`: one active auth implementation, validated credentials, cryptographic hashed verification codes, separate reset-code purpose, HttpOnly cookies and password-reset session invalidation. The legacy duplicate route implementations no longer expose alternate behavior.
4. `backend/src/middleware/security.js`, `server.js`, `models/User.js`, `models/Lead.js`: bounded request bodies and queries, operator rejection, allowed origins, request limiting, schema constraints, public dealer projections, active-subscription filtering, lead persistence and consistent error responses. General callbacks are valid without a dealer; dealer-specific inquiries validate the workshop on the server.
5. `frontend/src/lib/location.js`, `backend/src/routes/locationRoutes.js`: explicit GPS consent, timeouts, actionable fallback, provider-side address lookup, bounded cache, serialized requests and normalized metadata. Manual entry always works.
6. Dockerfiles, nginx and Compose: separate app containers, private MongoDB service, persistent volume, authenticated database, health checks and frontend SPA/API proxy.

## Run locally

Use Node 22+, MongoDB and the committed lockfiles.

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm ci --prefix backend
npm ci --prefix frontend
```

Set `MONGO_URI` and `JWT_SECRET` in `backend/.env`. Generate a JWT secret using `openssl rand -hex 32`. Backend environment loading uses the backend working directory:

```sh
cd backend
npm run dev
```

In a separate terminal, run `npm run dev --prefix frontend`. Open http://localhost:5173. Vite proxies `/api` to port 5001. Use the same origin for frontend and API; cookies use SameSite=Lax. Existing localStorage JWTs are discarded and users must log in again.

Configure Brevo SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_USER`) or `BREVO_API_KEY` plus `EMAIL_USER`. OTP registration returns a delivery error if email cannot be sent. Verification codes are never printed or returned except in `NODE_ENV=test` responses. Email verification does not falsely mark a phone as verified.

## Docker

```sh
cp .env.example .env
# Fill MONGO_PASSWORD and JWT_SECRET with separate URL-safe random values.
docker compose up --build -d
```

Open http://localhost:8080. MongoDB and the backend have no published host ports. Compose defaults to development mode for local HTTP cookie testing; demo subscriptions remain disabled. Production requires `NODE_ENV=production`, the exact HTTPS origin in `CORS_ORIGINS`, real email credentials, TLS termination in front of nginx, database backups and monitoring. Secure cookies require HTTPS. `TRUST_PROXY=1` assumes the included nginx is the only proxy directly reaching Express.

Docker has not been executed in the authoring environment because the Docker CLI is unavailable. Validate on the deployment host with `docker compose config`, `docker compose up --build`, `docker compose ps` and an end-to-end inquiry before release. Image tags should be pinned to approved digests by the deployment pipeline.

## Location provider

GPS city lookup defaults to OpenStreetMap Nominatim with rounded coordinates. Set `GEOCODER_URL` to use another compatible provider. Optional address suggestions require `VITE_GEOCODER_AUTOCOMPLETE_URL` pointing to a provider that explicitly supports autocomplete; this is a build-time setting.

The public Nominatim service prohibits autocomplete and requires application identification, caching and at most one request per second: https://operations.osmfoundation.org/policies/nominatim/ . Select a provider suitable for production traffic and comply with its terms. Do not send private street-address text to the public endpoint. OpenStreetMap attribution must remain visible wherever its results or maps are displayed.

## Validation

```sh
npm test --prefix backend
npm run build --prefix frontend
```

The security regression suite uses temporary HTTP listeners and mocked database methods; it does not claim MongoDB integration coverage. It verifies operator injection, origin rejection, the verified-account OTP bypass, expired JWTs, blocked unverified payments, private-field serialization, invalid dealer IDs, callback persistence, invalid location coordinates, API 404s and the provider fallback.

## Release dependencies and limits

- Payment processing was a demo that enabled subscriptions from client requests. It is blocked in production. Connect a real payment provider with server-side signature, amount, order and replay verification before accepting subscriptions. Development simulation requires the explicit `ALLOW_DEMO_SUBSCRIPTIONS=true` backend setting.
- Existing subscribed dealers need a valid `subscriptionDetails.expiresAt` to appear in public results. Audit existing records and migrate verified payment expiry data; do not invent subscriptions.
- Pre-change pending OTPs must be reissued because codes are now hashed. Password resets invalidate older session versions; ordinary logout clears the browser cookie.
- Rate limiting and geocoder cache are process-local. Use a shared store or gateway limits before running multiple backend replicas. The supplied deployment targets one backend replica.
- Lead and dealer listings are capped at 100. Add pagination before larger datasets need it.
- Inquiry email is best-effort after MongoDB persistence. Add a durable queue and retry monitoring if guaranteed notification delivery is required.
- Browser visual QA could not complete because the browser tool returned a session ownership error. Check mobile/desktop pages and contrast before release. No live MongoDB, email delivery, payment or container deployment was verified in this environment.
