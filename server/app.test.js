import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createApp } from './app.js';
import { normalizePhone, leadSchema } from './validation.js';

const validLead = { name: 'Example Founder', phone: '+91 98765 43210', city: 'Delhi',
  service: 'Private Limited Company Registration', plan: 'Standard', page: '/contact.html', consent: true, website: '' };

function repository(overrides = {}) {
  const saved = [];
  return { saved, isReady: () => true, save: async (lead, key) => {
    saved.push({ lead, key }); return { leadId: randomUUID(), duplicate: false };
  }, ...overrides };
}
async function withServer(options, fn) {
  const app = createApp({ repository: repository(), serveClient: false, ...options });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { return await fn(base); } finally { await new Promise(resolve => server.close(resolve)); }
}
const post = (base, body = validLead, headers = {}) => fetch(`${base}/api/leads`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
});

test('Indian mobile normalization accepts only supported prefixes and rejects junk', () => {
  for (const phone of ['9876543210', '+91 98765 43210', '09876543210', '(+91) 98765-43210']) assert.equal(normalizePhone(phone), '9876543210');
  for (const phone of ['00919876543210', '+1 9876543210', 'phone9876543210', '1234567890']) assert.equal(leadSchema.safeParse({ ...validLead, phone }).success, false);
});

test('save is awaited; a receipt is returned only after successful durable repository result', async () => {
  const repo = repository();
  await withServer({ repository: repo }, async base => {
    const key = randomUUID();
    const response = await post(base, validLead, { 'Idempotency-Key': key });
    assert.equal(response.status, 201);
    const json = await response.json();
    assert.equal(json.ok, true); assert.match(json.leadId, /^[a-f0-9-]{36}$/);
    assert.equal(repo.saved[0].lead.phone, '9876543210'); assert.equal(repo.saved[0].key, key);
    assert.equal(json.name, undefined); assert.equal(json.phone, undefined);
    assert.equal(response.headers.get('x-powered-by'), null);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });
});

test('schema rejects missing consent, object operators, invalid city/service, executable text and extra fields', async () => {
  const repo = repository();
  await withServer({ repository: repo, rateLimitMax: 20 }, async base => {
    const invalids = [{ ...validLead, consent: false }, { ...validLead, phone: { $ne: null } },
      { ...validLead, city: 'Mumbai' }, { ...validLead, service: 'Anything' },
      { ...validLead, name: '<script>alert(1)</script>' }, { ...validLead, administrator: true },
      { ...validLead, page: '//evil.example' }];
    for (const lead of invalids) assert.equal((await post(base, lead)).status, 400);
    assert.equal(repo.saved.length, 0);
  });
});

test('honeypot never stores or falsely acknowledges an enquiry', async () => {
  const repo = repository();
  await withServer({ repository: repo }, async base => {
    const response = await post(base, { ...validLead, website: 'bot filled this' });
    assert.equal(response.status, 400); assert.equal((await response.json()).ok, false); assert.equal(repo.saved.length, 0);
  });
});

test('cross-origin submissions are rejected; explicitly configured development origin works', async () => {
  const repo = repository();
  await withServer({ repository: repo, allowOrigins: ['http://localhost:5173'] }, async base => {
    assert.equal((await post(base, validLead, { Origin: 'https://untrusted.example', 'Sec-Fetch-Site': 'cross-site' })).status, 403);
    assert.equal((await post(base, validLead, { Origin: 'http://localhost:5173' })).status, 201);
    assert.equal(repo.saved.length, 1);
  });
});

test('request replay returns original receipt and different-payload key conflict returns 409', async () => {
  const leadId = randomUUID();
  await withServer({ repository: repository({ save: async () => ({ leadId, duplicate: true }) }) }, async base => {
    const response = await post(base); assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, leadId, duplicate: true, message: 'Your request is already saved. Our team will be in touch.' });
  });
  await withServer({ repository: repository({ save: async () => ({ conflict: true }) }) }, async base => {
    assert.equal((await post(base)).status, 409);
  });
});

test('database outage and write errors produce failure, never false success', async () => {
  for (const repo of [repository({ isReady: () => false }), repository({ save: async () => { throw new Error('private connection error'); } })]) {
    await withServer({ repository: repo }, async base => {
      const response = await post(base); assert.equal(response.status, 503);
      const json = await response.json(); assert.equal(json.ok, false); assert.equal(json.leadId, undefined);
      assert.doesNotMatch(JSON.stringify(json), /private connection/);
    });
  }
});

test('body limit, malformed JSON, unsupported media and malformed idempotency keys fail safely', async () => {
  await withServer({}, async base => {
    assert.equal((await post(base, { ...validLead, name: 'x'.repeat(13000) })).status, 413);
    assert.equal((await fetch(`${base}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
    assert.equal((await fetch(`${base}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' })).status, 415);
    assert.equal((await post(base, validLead, { 'Idempotency-Key': 'bad-key' })).status, 400);
  });
});

test('rate limit blocks excess lead submissions', async () => {
  const repo = repository();
  await withServer({ repository: repo, rateLimitMax: 2 }, async base => {
    assert.equal((await post(base)).status, 201); assert.equal((await post(base)).status, 201);
    assert.equal((await post(base)).status, 429); assert.equal(repo.saved.length, 2);
  });
});

test('health exposes only readiness, and no public lead reading endpoint exists', async () => {
  await withServer({ repository: repository({ isReady: () => false }) }, async base => {
    const health = await fetch(`${base}/api/health`); assert.equal(health.status, 503);
    assert.deepEqual(await health.json(), { ok: false, status: 'unavailable' });
    assert.equal((await fetch(`${base}/api/leads`)).status, 404);
  });
});

test('production enables restrictive browser security headers', async () => {
  await withServer({ production: true }, async base => {
    const response = await fetch(`${base}/api/health`);
    assert.match(response.headers.get('content-security-policy'), /script-src 'self'/);
    assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.match(response.headers.get('strict-transport-security'), /max-age/);
  });
});
