# Probay — premium white edition

JavaScript MERN rebuild: React, Express, Node.js and MongoDB/Mongoose. All 45 researched public routes, service information, pricing, policies and 218 FAQs are retained. The design uses crisp white, navy/blue, 27 custom editorial images, responsive carousels, GSAP reveals/parallax, Lenis smooth scrolling and a short session intro. Reduced-motion preferences are respected.

## Run locally

Requires Node.js 22.12+ and MongoDB. This computer already has MongoDB installed.

Install dependencies with `npm install`. In one terminal run `npm run db:start` and leave it running. In a second terminal run `npm run dev`.

Web preview: http://127.0.0.1:5173/ . API: http://127.0.0.1:3001/ . The helper starts an isolated MongoDB on loopback port27018 using `.data/mongo`; it does not change an existing MongoDB service. Keep the database process running while testing. Its PID/log are under `.runtime/`.

## Production build

```powershell
npm run build
npm test
npm run check:content
```

The build emits45 prerendered pages with unique titles, descriptions, canonical URLs, social metadata, the original structured-data graphs, a sitemap and a branded404. React hydrates the rendered HTML. It embeds only the current page data rather than shipping the entire content archive to every visitor. Fonts are self-hosted. Image masters remain outside the public bundle; optimised WebP/card variants are in `public/images/`.

For a local production-mode preview with the isolated database:

```powershell
node scripts/production-preview.mjs
```

Preview: http://127.0.0.1:4173/ . This helper is for local review, not an external deployment command.

## Deploy

Copy `.env.example` to `.env` and configure your own MongoDB URI and exact allowed HTTPS origin. Use TLS at the reverse proxy, bind Node appropriately and restrict database networking/access. Set `NODE_ENV=production`, build and run `npm start`. Set `SITE_URL` before building if the canonical domain differs from `https://probay.in`. Configure retention, backups and monitoring for the deployment. No live hosting or DNS was changed by this implementation.

Leads are saved durably before a success receipt is returned. Validation, consent, body limits, rate limiting, honeypot, origin checks, unique idempotency and duplicate handling protect submissions. There is no public lead-list/read API. Do not expose MongoDB or add an unauthenticated admin route. Production requires an explicit database URI. Optional external webhook forwarding is OFF unless the operator explicitly configures `LEAD_WEBHOOK_URL`; the original live Probay webhook is not copied into the app.

## Project map

- `client/src/App.jsx`: page templates, navigation, carousel, calculator UI and enquiry flow.
- `client/src/styles.css`: responsive base layout.
- `client/src/enhancements.css`: crisp-white/blue art direction and readable type scale.
- `client/src/finishing.css`: photography integration and finishing details.
- `client/src/data/`: deterministic migrated page content and manifest.
- `client/src/visuals.js`: image-to-service/city/guide mapping.
- `server/`: API, validation, persistence and security tests.
- `scripts/migrate_content.py`: content migration from the research evidence; `--check` detects drift.
- `scripts/prerender.mjs`: indexable HTML output for all routes.
- `docs/DESIGN-STRATEGY.md`: conversion, trust and motion rationale.
- `docs/ASSETS.md`: image direction and provenance.
- `research/probay-2026-10-29/`: full original study and public source evidence.

## Honest limits

Photos are conceptual editorial imagery, not actual Probay staff/client/premises evidence. No invented testimonials, clients or success counts are used. Regulatory prose remains the original dated content and needs business/professional review before launch. The original privacy page is preserved; update its analytics description to match the final deployment's actual tools. Analytics are not connected to the live account during development. Production credentials, live notification delivery and an authenticated staff workflow must be configured by the operator; a local database receipt does not imply that Probay’s real team received anything.
