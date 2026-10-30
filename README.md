# Probay website

Frontend-only React + JavaScript website built with Vite and hosted on Vercel. All 45 pages, 218 FAQs, pricing, calculator, images and visual interactions are retained. Production pages are generated as static HTML during the build. There is no application server, API, database or serverless function.

## Run locally

Use Node.js 22.12 or later.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

Development: http://127.0.0.1:5173. Production preview: http://127.0.0.1:4173.

## Structure

```text
src/           React UI, styles, calculator, enquiry helpers and page data
public/        Images, favicon and static page JSON
scripts/       Build-time HTML prerendering and asset provenance
tests/        Content, calculator and enquiry checks
docs/         Design, image provenance and verification notes
vercel.json    Hosting, routing and security headers
```

`src/prerender.jsx` is used only by the build to generate HTML. It is not a running backend. `.prerender/` and `dist/` are generated and ignored by Git.

## Enquiries

The existing form validates name, Indian mobile number, city, service and consent in the browser. It prepares a WhatsApp message for Probay's existing business number. The visitor must choose **Continue on WhatsApp**, review the message and send it. Nothing is submitted or saved before that action; the confirmation explains this. There is no database persistence or automatic email delivery. Personal details are not stored in browser storage.

Phone, email, WhatsApp links, plan selection, service filters, FAQ accordions, carousels and the cost calculator work directly in the browser.

## Deploy on Vercel

Import `balpreet31/new`, branch `main`, project root `./`. The repository config selects Vite, `npm run build`, and `dist`. No secrets or database environment variables are needed. Every `.html` URL is a real generated page, with a static 404 for unknown paths.

Vercel's production hostname is used for canonical URLs, structured data and the sitemap. Set optional build variable `SITE_URL=https://your-domain.example` when switching to a custom domain. Further pushes to `main` trigger deployments through the linked Git integration.

Image provenance is recorded in `docs/ASSETS.md`.
