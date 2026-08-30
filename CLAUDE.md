# Marginalia

**Version:** n/a (single-file app) | **Stack:** plain HTML/CSS/JS, zero dependencies | **Runtime:** any modern browser

## What
A quiet corner before the busy work — a breathing circle, a thoughtful quote, book picks, and sticky notes tucked at the edge of the screen. Notes save only to your own browser (`localStorage`); nothing leaves your device.

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

1. **Sticky notes** — renders/edits/deletes notes, persists them, and (optionally)
   syncs across devices when running inside Claude's Artifact platform.
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

Sticky notes are stored **only** in the visitor's own browser via
`localStorage` (key: `marginalia:notes`). There is no account, no backend,
and no data shared between visitors or devices by default. A dismissal flag
for the install banner (`marginalia:installBannerDismissed`) is stored the
same way.

**Sync adapter (swap point, not a finished feature):** the `syncAdapter`
object in the notes script (search `index.html` for `syncAdapter`) is the
one place remote sync lives. Any replacement needs the same three-member
shape:
- `.init(onReady)` — run once at load; call `onReady()` only if your
  backend is actually reachable.
- `.push(notes)` — called after every local edit with the full notes
  array; persist it however your backend wants. `saveLocal()` has already
  run first, so a user's notes are never at risk even if this fails.
- `.active` — boolean your `init`/`push` keep current, read by the
  drawer's status pill.

The shipped implementation calls `window.claude.use('artifact')` and
activates *only* when the page happens to be running inside Claude's
Artifact hosting platform; everywhere else (GitHub Pages, a local file, any
other browser) `init()` never calls `onReady`, and the app runs on
`localStorage` alone. Replace the `syncAdapter` object with your own
Notion/Firebase/custom-API implementation of the same shape to wire up a
different backend — nothing else in the file needs to change.

## Configuration

None. There are no environment variables, no `.env` file, and no build-time
config — the entire app is static, client-side HTML/CSS/JS.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
