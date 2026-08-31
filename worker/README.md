# Marginalia sync Worker

A tiny Cloudflare Worker that gives Marginalia real cross-device sync: your
notes and keepsakes each live in their own Cloudflare KV key instead of only
in each browser's `localStorage`. This is the reference implementation of the
`createListSync()` swap point described in the main
[CLAUDE.md](../CLAUDE.md) — deploy your own copy and nothing else in
`index.html` needs to change beyond pasting in your Worker's URL and key.

Four endpoints — `/notes` and `/keepsakes`, each with the same GET/POST
shape, all requiring an `X-API-Key` header:

- `GET /notes` — returns the current notes array (`[]` if nothing synced yet)
- `POST /notes` — overwrites it with the array in the request body
- `GET /keepsakes` — same, for the kept-notes list
- `POST /keepsakes` — same, for the kept-notes list

No accounts, no per-item diffing — the incoming array is always the full,
authoritative list, so drag-reordering just works (array order *is* note
order). Whichever device pushes last wins, atomically, for the whole list.
Both resources share the same `X-API-Key` and the same `NOTES` KV namespace
(just different keys within it) — there's nothing extra to provision for
keepsakes.

## Setup

Requires a free Cloudflare account and the `wrangler` CLI
(`npm install -g wrangler`, then `wrangler login`).

```bash
cd worker
npm install

# Create the KV namespace that will hold your notes and keepsakes
wrangler kv namespace create NOTES
```

That prints an `id` — paste it into `wrangler.toml`, replacing
`REPLACE_WITH_YOUR_KV_NAMESPACE_ID`:

```toml
[[kv_namespaces]]
binding = "NOTES"
id = "the-id-you-just-got"
```

Then deploy and set your shared secret (pick any long random string — this
is what stands between "your notes" and anyone who finds your Worker URL):

```bash
wrangler deploy
wrangler secret put API_KEY
```

`wrangler deploy` prints your Worker's URL
(`https://marginalia-sync.<your-subdomain>.workers.dev`). Open Marginalia,
find the sync settings (gear icon in the notes drawer), and paste in that
URL and the `API_KEY` value you just set. That's it — sync is live.

## Local development

```bash
npm run dev         # runs the Worker locally via wrangler dev
npm run typecheck   # tsc --noEmit
```
