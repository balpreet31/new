import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leadSchema, idempotencySchema } from './validation.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadKnownPaths() {
  try {
    const data = JSON.parse(readFileSync(path.join(ROOT, 'client/src/data/pages.json'), 'utf8'));
    const values = Array.isArray(data) ? data : Object.values(data);
    return new Set(['/', '/index.html', ...values.flatMap(page => {
      const value = page.path || page.slug || page.url || page.file;
      if (!value) return [];
      try { return [new URL(value, 'https://probay.in').pathname]; } catch { return []; }
    })]);
  } catch { return new Set(['/', '/index.html']); }
}

export function createApp({ repository, allowOrigins = [], production = process.env.NODE_ENV === 'production',
  webhookUrl = '', serveClient = production, knownPaths = loadKnownPaths(), rateLimitMax = 8 } = {}) {
  if (!repository) throw new Error('A lead repository is required.');
  const app = express();
  app.disable('x-powered-by');
  app.set('query parser', 'simple');
  app.use(helmet({
    contentSecurityPolicy: production ? { directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'], imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"], objectSrc: ["'none'"], baseUri: ["'self'"],
      formAction: ["'self'"], frameAncestors: ["'none'"],
    } } : false,
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: production ? undefined : false,
  }));
  app.use((_req, res, next) => {
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.get('/api/health', (_req, res) => {
    const ready = repository.isReady();
    res.set('Cache-Control', 'no-store').status(ready ? 200 : 503).json({ ok: ready, status: ready ? 'ready' : 'unavailable' });
  });
  const leadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: rateLimitMax,
    standardHeaders: 'draft-8', legacyHeaders: false,
    message: { ok: false, message: 'Too many requests. Please try again later or call us.' } });
  app.post('/api/leads', leadLimiter, (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const origin = req.get('origin');
    const expectedOrigin = `${req.protocol}://${req.get('host')}`;
    if (req.get('sec-fetch-site') === 'cross-site' && !allowOrigins.includes(origin)) {
      return res.status(403).json({ ok: false, message: 'This request is not allowed.' });
    }
    if (origin && origin !== expectedOrigin && !allowOrigins.includes(origin)) {
      return res.status(403).json({ ok: false, message: 'This request is not allowed.' });
    }
    if (!req.is('application/json')) return res.status(415).json({ ok: false, message: 'Please send JSON.' });
    next();
  }, express.json({ limit: '12kb', strict: true }), async (req, res) => {
    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields = {};
      for (const issue of parsed.error.issues) fields[issue.path[0] || 'form'] ||= issue.message;
      return res.status(400).json({ ok: false, message: 'Please check the highlighted details.', fields });
    }
    if (parsed.data.website) return res.status(400).json({ ok: false, message: 'Unable to process this request.' });
    const key = req.get('Idempotency-Key');
    if (key && !idempotencySchema.safeParse(key).success) return res.status(400).json({ ok: false, message: 'Invalid request identifier.' });
    if (!repository.isReady()) return res.status(503).json({ ok: false, message: 'We could not save your request. Please retry or contact us on WhatsApp.' });
    try {
      const saved = await repository.save(parsed.data, key);
      if (saved.conflict) return res.status(409).json({ ok: false, message: 'This request identifier has already been used. Please refresh and try again.' });
      if (webhookUrl && !saved.duplicate) {
        // Server-only destination, configured explicitly by the operator. Never accept a visitor-controlled URL.
        void forwardWebhook(webhookUrl, parsed.data, saved.leadId, repository);
      }
      return res.status(saved.duplicate ? 200 : 201).json({ ok: true, leadId: saved.leadId,
        duplicate: Boolean(saved.duplicate), message: saved.duplicate ? 'Your request is already saved. Our team will be in touch.' : 'Your request has been saved. Our team will be in touch during business hours.' });
    } catch {
      return res.status(503).json({ ok: false, message: 'We could not save your request. Please retry or contact us on WhatsApp.' });
    }
  });
  app.use('/api', (_req, res) => res.status(404).json({ ok: false, message: 'Not found.' }));
  if (serveClient) {
    const dist = path.join(ROOT, 'dist');
    app.use(express.static(dist, { index: false, maxAge: '1h', dotfiles: 'deny', fallthrough: true }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || !knownPaths.has(req.path)) return next();
      const candidate = req.path === '/' ? path.join(dist, 'index.html') : path.join(dist, req.path.slice(1));
      const file = existsSync(candidate) ? candidate : path.join(dist, 'index.html');
      if (existsSync(file)) return res.sendFile(file);
      next();
    });
  }
  app.use((_req, res) => {
    const notFound = path.join(ROOT, 'dist/404.html');
    if (serveClient && existsSync(notFound)) return res.status(404).sendFile(notFound);
    return res.status(404).type('text').send('Page not found.');
  });
  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.too.large') return res.status(413).json({ ok: false, message: 'This request is too large.' });
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ ok: false, message: 'Invalid JSON.' });
    return res.status(500).json({ ok: false, message: 'Something went wrong. Please try again.' });
  });
  return app;
}

async function forwardWebhook(url, lead, leadId, repository) {
  try {
    const { website, ...payload } = lead;
    const response = await fetch(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(5000),
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': leadId }, body: JSON.stringify({ ...payload, leadId }) });
    await repository.markWebhook?.(leadId, response.ok ? 'sent' : 'failed');
  } catch {
    try { await repository.markWebhook?.(leadId, 'failed'); } catch { /* Stored lead remains available to the operator. */ }
  }
}
