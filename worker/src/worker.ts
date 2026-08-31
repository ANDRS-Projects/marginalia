import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

const NOTES_KEY = 'marginalia:notes';

const app = new Hono<{ Bindings: Env }>();

// ── Auth ──────────────────────────────────────────────────────────────────
// Every request must carry the shared secret as X-API-Key. There is no
// per-user account system here — this Worker is meant to be deployed once
// per person (you, or an OSS user standing up their own copy), and the key
// is the only thing standing between "your notes" and anyone who happens to
// discover the Worker URL. CORS is left wide open (`*`) deliberately: the
// key is the real gate, not Origin matching — Origin matching would be
// brittle here anyway (a Claude Artifact's serving origin can vary between
// versions of the same artifact).
app.use('/notes', cors());

// Rate limit before the auth check, keyed by IP. Free, harmless, and adds
// some friction, but don't rely on this as the real defense against
// brute-forcing API_KEY — Cloudflare's own docs describe this binding as
// "eventually consistent" and enforced per-isolate/per-datacenter rather
// than with one global counter, so it's a loose filter, not a guarantee
// (confirmed empirically: 100+ rapid requests here didn't reliably trip
// it). The actual defense is API_KEY's length — a 256-bit random string
// (openssl rand -hex 32, per the README) makes brute-forcing infeasible
// regardless of how many guesses get through.
// https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
app.use('/notes', async (c, next) => {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const { success } = await c.env.RATE_LIMITER.limit({ key: ip });
  if (!success) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }
  await next();
});

app.use('/notes', async (c, next) => {
  const key = c.req.header('X-API-Key');
  if (!key || key !== c.env.API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

// ── GET /notes — return the current notes array ─────────────────────────────
app.get('/notes', async (c) => {
  const raw = await c.env.NOTES.get(NOTES_KEY);
  const notes = raw ? JSON.parse(raw) : [];
  return c.json(notes);
});

// ── POST /notes — overwrite the notes array ──────────────────────────────────
// No per-note diffing, no reconciliation: the incoming array is the full,
// authoritative list (array order == note order, so drag-reordering just
// works). Whichever device pushes last wins, atomically, for the whole list.
app.post('/notes', async (c) => {
  let notes: unknown;
  try {
    notes = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
  if (!Array.isArray(notes)) {
    return c.json({ error: 'Expected a JSON array of notes' }, 400);
  }
  await c.env.NOTES.put(NOTES_KEY, JSON.stringify(notes));
  return c.json({ ok: true });
});

export default app;
