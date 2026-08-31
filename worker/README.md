# Marginalia sync Worker

A tiny Cloudflare Worker that gives Marginalia real cross-device sync: your
notes live in one Cloudflare KV key instead of only in each browser's
`localStorage`. This is the reference implementation of the `syncAdapter`
swap point described in the main [CLAUDE.md](../CLAUDE.md) — deploy your own
copy and nothing else in `index.html` needs to change beyond pasting in your
Worker's URL and key.

Two endpoints, both requiring an `X-API-Key` header:

- `GET /notes` — returns the current notes array (`[]` if nothing synced yet)
- `POST /notes` — overwrites it with the array in the request body

No accounts, no per-note diffing — the incoming array is always the full,
authoritative list, so drag-reordering just works (array order *is* note
order). Whichever device pushes last wins, atomically, for the whole list.

`/notes` also carries a Cloudflare rate limit (30 requests/minute per IP) —
a free, harmless extra layer, but not a real security boundary: Cloudflare's
own docs describe this binding as "eventually consistent" and enforced
per-isolate rather than with one global counter, and testing this
confirmed it doesn't reliably trip even under a fast burst. The actual
defense against brute-forcing `API_KEY` is its length — a 256-bit random
string (`openssl rand -hex 32`, per the setup steps above) makes guessing
infeasible regardless. Nothing to set up for the rate limit itself; the
`namespace_id` in `wrangler.toml`'s `[[ratelimits]]` block is just an
arbitrary number, not something you provision.

## Setup

Requires a free Cloudflare account and the `wrangler` CLI
(`npm install -g wrangler`, then `wrangler login`).

```bash
cd worker
npm install

# Create the KV namespace that will hold your notes
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
