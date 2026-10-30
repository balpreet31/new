# Design and content

The frontend retains the existing white, navy and blue visual system, full-screen architectural hero, typography, image treatments, responsive layouts and page content. This conversion changes application structure and enquiry delivery, not the design.

All 45 source URLs, 218 FAQs, ten services, three registration plans, original editorial copy and calculator rules remain in `src/data`. Each production page has its own static HTML, title, description, canonical URL and retained structured data.

The consultation modal and inline form retain their layout and validation. Valid details produce a prefilled WhatsApp link. Confirmation text asks the visitor to send the message, rather than claiming a database submission. Phone and email provide alternative contact channels.

Lenis smooth scrolling, GSAP reveal/parallax motion, the introductory preloader and accessible carousels remain in the browser. Reduced-motion preferences, keyboard navigation and mobile navigation are retained.

There are no backend credentials, API routes, database drivers or serverless functions. Vercel serves generated static assets with HTTPS and response security headers. Content security policy permits the local scripts, fonts, images and motion styles used by the site.
