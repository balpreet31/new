# Image provenance

The existing generated image collection is retained in `public/images`. It was created with the built-in Imagegen tool on 29 October 2026 for the white-and-blue Probay design. These are conceptual editorial images, not photographs of actual Probay offices, employees or clients. The original Probay logo is retained from its public website.

`hero-v2.webp` is the full-screen architectural hero. Service, location, guide, process and compliance images are mapped in `src/visuals.js`. WebP variants keep page images lightweight, and card variants reduce carousel downloads. `scripts/generated-assets.json` records the generated asset mapping for reference; it is not needed at runtime.

No images, image treatments or UI styling were changed during the frontend-only conversion. Older unused visual drafts and the original website crawl are recoverable from Git history rather than included in the active frontend project.
