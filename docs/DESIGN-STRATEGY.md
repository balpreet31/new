# Probay redesign strategy

## Direction

An established professional advisory brand on a predominantly pure-white canvas: white `#fff`, navy `#10273d`, vivid Probay-compatible blue `#245cdb`, readable slate `#617083` and fine cool dividers. No beige, olive, lime or dusty wash. Use near-white `#f7f9fc` only for small supporting elements; section rhythm comes from stronger typography, intentional image crops, blue accents and generous whitespace rather than alternating tinted blocks. Preserve the authentic existing logo and all published business facts. Atmospheric generated photography is conceptual imagery, never labelled as real Probay premises or employees.

## White-edition art direction

The hero pairs a full-screen cool architectural photograph with a clean-white gradient and a confident dark/blue headline. Type has been scaled up across desktop and mobile: normal body copy is 14–16px, controls and form labels are legible, and important fees/exclusions are readable beside the action. Photographic service cards, relevant local images and editorial guide images add visual specificity. Interior services and long-form pages receive related photographs without changing their existing prose or policy wording.

The process is a precise four-stage line on white. The flagship pricing plan is high-contrast navy with explicitly white/light-blue features. One deliberate royal-blue conversion band provides an emphatic ending; the footer returns to pure white. Image zoom, parallax and scroll reveals support hierarchy and respect reduced-motion preferences. No new factual claims are introduced by decoration or photography.

## Visitor journey

1. Recognise the offer, geography, professional fee basis and accountable team immediately.
2. Explore ten services through a controlled horizontal catalogue with category tabs and swipe/buttons.
3. Understand the existing four-stage process and deliverables.
4. Compare the three original Private Limited plans with exclusions clearly adjacent.
5. Read deeper service pages, structure comparison, local expertise and deadline information.
6. Use a functioning calculator or request an itemised written quote.
7. Submit once, receive a database-confirmed receipt, then optionally continue on WhatsApp.

## Content and routes

All 45 original pages retain their URLs, titles, main prose, fee tables, FAQs and policy wording. Structured hero, facts, forms and navigation replace legacy presentation. A deterministic migration retains source evidence; build-time prerendering supplies indexable content and per-route metadata. Preserve dated regulatory statements; don't silently invent current legal updates.

## Motion

Short brand preloader once per session, never wait for remote content. GSAP reveal sequences for headings/sections, image masking and modest horizontal offsets; subtle parallax on hero/editorial photographs. Lenis smooth scroll only for fine-pointer desktop users with no reduced-motion preference. Carousels are user controlled, scroll-snap based, keyboard accessible, swipe friendly and never auto-advance. No scroll hijacking. Native reading remains functional without enhanced motion; reduced-motion disables parallax, reveal travel, smooth scroll and loader animation.

## Trust and conversion

Use the original corporate identifiers, address, hours and contacts. Clearly qualify fees, government processing and images. Never invent customers, reviews, ratings, awards, incorporation counts or government affiliation. Fix dead consultation anchors through a single accessible enquiry dialog and on-page forms. Plan buttons retain selected context. Show loading/error/retry states; claim success only after MongoDB persistence. Keep WhatsApp optional rather than implying a message has already been sent.

## Security boundary

Validate and allowlist server-side, cap JSON body sizes, rate-limit submissions, check origins, use honeypots and idempotency, avoid public lead listing and sensitive logs, and send security headers. Database URI and optional integration URL stay server-side. Default local MongoDB binds to loopback. Deploy behind TLS with access-controlled managed MongoDB, backups and retention review. Security is ongoing; this implementation cannot promise absolute security.

## Measure after launch

Review service exploration → plan selection → form start → durable enquiry → optional WhatsApp progression. Compare mobile completion, validation errors, calculator use, submission failures and real lead quality. Analytics integrations are not activated against the live site's account during development. Respect privacy and consent choices before enabling optional trackers.

## Image generation

Built-in Imagegen generated two project assets: a realistic Delhi NCR-inspired architectural courtyard, and a natural document-desk still life. Full prompts and asset locations are in `ASSETS.md`. Images communicate atmosphere; they are not documentation of actual office space.
