# Marginalia

**Version:** n/a (single-file app) | **Stack:** plain HTML/CSS/JS, zero dependencies | **Runtime:** any modern browser

## What
A quiet corner before the busy work — a breathing circle, a thoughtful quote, book picks, and sticky notes tucked at the edge of the screen. A second margin tab, Keepsakes, holds notes you've deliberately kept: sealed, read-only, chronological. Everything saves only to your own browser (`localStorage`); nothing leaves your device.

## Quick Start

```bash
./setup.sh              # Opens index.html directly, or serves it locally
```

There is no install step, build step, dev server, linter, or test suite — this
is a single self-contained `index.html` file. Do not invent npm/build commands
that don't exist here.

## Commands

```bash
open index.html                 # macOS: open directly in the default browser
xdg-open index.html             # Linux: open directly in the default browser
python3 -m http.server 8000     # Optional: serve locally at http://localhost:8000
```

That's the entire command surface. No `package.json`, no build tool, no test
runner exist in this repo.

## Architecture

```
index.html   # everything: HTML structure, <style> CSS, and three <script> blocks
```

One file, three inline `<script>` blocks, each an IIFE with its own concern:

1. **Sticky notes + Keepsakes** — renders/edits/deletes notes, persists them,
   and (optionally, once configured) syncs across devices via a pluggable
   `createListSync()`. Also owns the Keepsakes drawer — a second margin tab
   for notes moved out of Notes via the ❧ action: sealed, read-only,
   chronological. Both drawers are driven by a generalized `tabs[]`
   controller (search `index.html` for "Margin tabs") so a third tab is a
   small, additive change, not a rewrite. Also owns Reflect — a one-shot,
   bring-your-own-model completion (`askThought()`, search `index.html` for
   "Reflect (bring your own model)") triggered per-note, entirely separate
   from the sync credentials/adapter above.
2. **Breathing circle + quotes + books** — a 4-phase breathing animation, a
   quote rotator (20s interval + "Another" button), and a random 3-of-11 book
   picker ("Shuffle" button). Purely presentational, no persistence.
3. **Install banner** — a hand-rolled "Add to Home Screen" (iOS Safari) / "Add
   to Dock" (macOS Safari) prompt, since Safari has no native install prompt.

The only external network dependency is a Google Fonts CDN `<link>`
(Fraunces, Public Sans, IBM Plex Mono, Caveat). The PWA manifest and app icons
are embedded as `data:` URIs directly in the `<head>` — no separate icon files
or `manifest.json` on disk.

## Key Files

```
index.html    the entire application (head/meta/PWA icons, CSS, markup, JS)
setup.sh      opens or serves index.html locally — no dependencies to install
```

## Storage & Privacy Model

Notes and keepsakes are each stored **only** in the visitor's own browser via
`localStorage` (keys: `marginalia:notes`, `marginalia:keepsakes`) unless the
optional sync feature below is configured. There is no account, no backend,
and no data shared between visitors or devices by default. A dismissal flag
for the install banner (`marginalia:installBannerDismissed`) is stored the
same way.

**Sync adapter:** `createListSync(path, statusEl, statusLabelEl)` in the
notes script (search `index.html` for `createListSync`) is the one place
remote sync lives — instantiated once per resource (`syncAdapter` for
`/notes`, `keepsakeSyncAdapter` for `/keepsakes`), both reading the same
shared credentials via `getSyncConfig()`. Any replacement backend needs the
same per-instance shape:
- `.init(onReady)` — run once at load (and again whenever that resource's
  dock tab is opened); call `onReady(remoteItems)` only if your backend is
  actually reachable — `remoteItems` is whatever it currently holds (an
  array, possibly empty). Never call it otherwise.
- `.push(items)` — called after every local edit with the full array for
  that resource; persist it however your backend wants. The local save has
  already run first, so a user's data is never at risk even if this fails.
- `.active` — boolean your `init`/`push` keep current, read by that
  resource's status pill.

The shipped default implementation talks to a small Cloudflare Worker
backed by two Cloudflare KV keys — one per resource — see `worker/` and
`worker/README.md` to deploy your own copy. It reads a Worker URL and API
key from `localStorage` (keys: `marginalia:syncUrl`, `marginalia:syncApiKey`),
set via the sync settings panel (gear icon next to the status pill in the
Notes drawer) — the same credentials cover both `/notes` and `/keepsakes`.
Unconfigured, `init()` never calls `onReady` and the app runs on
`localStorage` alone. Replace `createListSync()`'s implementation with your
own Notion/Firebase/custom-API version of the same shape to wire up a
different backend — nothing else in the file needs to change.

**Reflect adapter:** `askThought(prompt)` (search `index.html` for "Reflect
(bring your own model)") is the one place the Reflect action's network call
lives. It's a one-shot request/response, not a list-sync resource — no
`.init`/`.push`/`.active` shape, just a function that returns a Promise
resolving to a short string. Config lives separately from the sync
credentials, in its own `localStorage` keys (`marginalia:thoughtUrl`,
`marginalia:thoughtApiKey`, `marginalia:thoughtModel`, and the optional
`marginalia:thoughtWorkspaceId` for Anthropic's multi-workspace personal/
service-account keys — see `anthropic-workspace-id` in Anthropic's docs),
set via the "AI" settings panel (button next to the sync gear). The default
request shape matches Anthropic's Messages API, including the
`anthropic-dangerous-direct-browser-access` header that lets a static page
call it directly with no relay. Point it at a different OpenAI-compatible
endpoint (your own Worker relay, a local Ollama instance, etc.) by editing
the headers/body inside `askThought()` — nothing else in the file needs to
change. Unlike the sync key, this is the user's own billable third-party API
key; the settings panel says so plainly, and no request happens without an
explicit tap of "Reflect" on a specific note.

**"From your margins" reuses `askThought()` but builds a different prompt.**
`buildPersonalPrompt()` (search `index.html` for the same name) samples up
to six recent notes and six keepsakes and folds their text into the prompt
— genuinely personal, unlike Reflect's generic-until-you-pick-a-note
framing. It's exposed as `window.marginaliaAskPersonalThought()`, the same
kind of narrow cross-script bridge as `marginaliaKeepText`/`marginaliaAskThought`,
since the panel that calls it lives in the separate quotes/breathing script.
Same credentials as Reflect (one settings panel enables both), but a wider
slice of your content goes out with every tap of "Another" there, not just
one note's text — see the Storage & Privacy note in the README before
changing what this sends.

## Configuration

None. There are no environment variables, no `.env` file, and no build-time
config — the entire app is static, client-side HTML/CSS/JS.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
