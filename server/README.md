# Enquiry API

JavaScript Express/Mongoose API. `POST /api/leads` only confirms success after MongoDB persistence. There is no public endpoint to read enquiries.

## Local configuration

Copy the values in `server/.env.example` into the repository root `.env` (dotenv loads from the root working directory). Run `npm run db:start` in a separate terminal for the installed local MongoDB binary, or configure a private MongoDB instance. Start the API with `npm run dev:api`. It listens on `127.0.0.1:3001` unless `HOST`/`API_PORT` are set. The frontend's Vite proxy forwards `/api` to that address; a browser should use relative `/api/leads`. Local MongoDB defaults to loopback port 27018 to avoid interfering with a normal installed service on 27017.

`GET /api/health` returns 200 only while MongoDB is connected, otherwise 503. Failed writes also return 503. The UI should keep input on failure, display the server message and provide a manually activated WhatsApp/phone fallback. Never treat merely reaching the client-side validation step as a conversion.

## Request contract

JSON keys: `name`, `phone`, `city`, `service`, `plan`, `page`, `consent: true`, optional empty `website` honeypot and optional `attribution: {source,medium,campaign}`. `city` and `service` are strict allowlists in `validation.js`. `page` is `/` or a root `.html` path. Mobile numbers normalize `+91` and initial `0` before ten-digit validation. Additional keys and object values are rejected.

Send a UUID in `Idempotency-Key`; retain it when retrying the same payload. A successful insert returns 201 with `{ok,leadId,duplicate:false,message}`. A short duplicate or replay returns 200 with the same receipt and `duplicate:true`. Reusing a request identifier for a different contact/service/plan/page returns 409. Keep the receipt private; it is not an authentication credential or public lookup token.

## Security and data handling

- Helmet, restrictive production CSP, denied framing and browser hardware permissions; JSON-only body limited to 12KB.
- Same-origin requests, configurable exact development origin allowlist and Fetch Metadata checks. No wildcard CORS or public database access.
- Eight lead submissions per IP per fifteen minutes by default. Run a dedicated/shared rate limiter and configure trusted proxy hops before horizontally scaling or deploying behind a proxy. Do not broadly enable `trust proxy`.
- Schema-based field validation rejects operator injection, markup and control characters. No sensitive values are logged.
- MongoDB indexes enforce request-key and concurrent same-bucket uniqueness. Rolling-ten-minute queries catch ordinary duplicate submissions.
- Enquiry records expire after 24 months using MongoDB TTL (deletion is asynchronous). Client engagement records requiring different retention should be moved to a separately governed system before expiration.
- An optional HTTPS `LEAD_WEBHOOK_URL` is disabled by default. When explicitly set, forwarding happens only after persistence; failure is recorded without losing the saved lead. Inspect failed forwarding states privately and retry through a controlled operations process. No automatic webhook retry worker is included.
- Deploy MongoDB behind authentication, TLS, firewall/network allowlists and encrypted backups. The application cannot guarantee those deployment properties by itself.
- Production requires an explicit `MONGODB_URI`. Run behind HTTPS. Production browser assets are served from root `dist/`; known HTML routes preserve SEO paths and unknown routes return 404.
- There is intentionally no public administration UI. Read leads only through authenticated private operational tooling with least-privilege database permissions.

Run `node --test server/*.test.js` from the repository root. Tests inject a repository and never submit to the original website or webhook.
