import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

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
app.use('/keepsakes', cors());
app.use('/notes', async (c, next) => {
  const key = c.req.header('X-API-Key');
  if (!key || key !== c.env.API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});
app.use('/keepsakes', async (c, next) => {
  const key = c.req.header('X-API-Key');
  if (!key || key !== c.env.API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

// ── /notes and /keepsakes — same shape, two separate KV keys ────────────────
// Keepsakes are notes a person has deliberately kept, so they get their own
// list (and their own KV key) rather than a flag on a note — that mirrors
// how the client treats them as a separate, sealed collection, not a filter
// over the same one. Both routes share this one GET/POST implementation:
// no per-item diffing, no reconciliation — the incoming array is always the
// full, authoritative list (array order == item order, so drag-reordering
// just works). Whichever device pushes last wins, atomically, for the whole
// list.
function mountListRoute(path: string, kvKey: string) {
  app.get(path, async (c) => {
    const raw = await c.env.NOTES.get(kvKey);
    const items = raw ? JSON.parse(raw) : [];
    return c.json(items);
  });

  app.post(path, async (c) => {
    let items: unknown;
    try {
      items = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    if (!Array.isArray(items)) {
      return c.json({ error: 'Expected a JSON array' }, 400);
    }
    await c.env.NOTES.put(kvKey, JSON.stringify(items));
    return c.json({ ok: true });
  });
}

mountListRoute('/notes', 'marginalia:notes');
mountListRoute('/keepsakes', 'marginalia:keepsakes');

export default app;
