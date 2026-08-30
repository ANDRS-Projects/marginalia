# Marginalia

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Trivy](https://github.com/ANDRS-Projects/marginalia/actions/workflows/trivy.yml/badge.svg)](https://github.com/ANDRS-Projects/marginalia/actions/workflows/trivy.yml)
[![Gitleaks](https://github.com/ANDRS-Projects/marginalia/actions/workflows/gitleaks.yml/badge.svg)](https://github.com/ANDRS-Projects/marginalia/actions/workflows/gitleaks.yml)
[![Zero dependencies](https://img.shields.io/badge/dependencies-zero-6f42c1)](index.html)
[![CLAUDE.md](https://img.shields.io/badge/CLAUDE.md-✓-6f42c1)](CLAUDE.md)

A quiet corner before the busy work — a breathing circle, a thoughtful quote,
book picks, and sticky notes tucked at the edge of the screen. Notes save
only to your own browser (`localStorage`); nothing leaves your device.

## Features

- **Breathing circle** — a slow, four-phase breathing prompt (Breathe in /
  Hold / Breathe out / Hold) to sit with for a moment before anything else.
- **A quote to sit with** — rotates on its own, or tap "Another" for the next
  one.
- **Book picks** — three random suggestions from a small, hand-picked shelf;
  tap "Shuffle" for a new set.
- **Sticky notes** — a slide-out drawer of notes you can add, edit, and
  delete, saved only in your own browser.
- **Installable** — works as a home-screen / dock app on iOS and macOS
  Safari (which have no native install prompt), via a small in-page banner.

<img width="1600" height="900" alt="IMG_4471" src="https://github.com/user-attachments/assets/bd88b6d0-0822-4d6e-80aa-ce7d3df0ba3a" />


## Quick Start

```bash
git clone https://github.com/ANDRS-Projects/marginalia.git
cd marginalia
./setup.sh
```

Or skip cloning entirely and just try it hosted:
**https://andrs-projects.github.io/marginalia/**

See [CLAUDE.md](CLAUDE.md) for the full command reference and architecture.

## Prerequisites

- Any modern web browser
- That's it. No runtime, no package manager, no build tool.

## How it works

Marginalia is a single self-contained `index.html` file — no build step, no
server, and no dependencies except a Google Fonts CDN stylesheet and a couple
of embedded `data:` URI images (the app icon). You can:

1. **Visit it hosted** via GitHub Pages — the repo serves `index.html` from
   the default branch root at
   [https://andrs-projects.github.io/marginalia/](https://andrs-projects.github.io/marginalia/).
2. **Download and open it directly** in any browser — right-click "Save As"
   (or `git clone`) and open `index.html` locally. It's fully offline-capable
   except for the one-time Google Fonts request.

## Storage & Privacy

This is the whole point of this release, so to be explicit:

- Notes are stored **only** in your own browser, via `localStorage`. There is
  no account, no sign-in, and no backend server involved.
- Nothing is sent anywhere, and nothing is shared between visitors — your
  notes on your laptop are invisible to anyone else, including on the exact
  same hosted URL.
- Clearing your browser data (or using a different browser/device) means a
  fresh, empty set of notes. That's expected, not a bug.

*Aside, not a feature most visitors need to think about:* the code has a
`syncAdapter` object (see [CLAUDE.md](CLAUDE.md)) as a documented swap-in
point for developers who want cross-device sync — Notion, your own API,
whatever. The shipped default only activates automatic sync when this page
happens to be running inside Claude's Artifact hosting platform, and is a
no-op everywhere else, including on GitHub Pages or a locally opened file.
It has no effect on the default, privacy-first, browser-only storage model
described above unless you deliberately replace it.

## Development

There is no dev server, build step, linter, or test suite — it's one static
HTML file. To work on it:

```bash
open index.html                 # macOS
xdg-open index.html             # Linux
python3 -m http.server 8000     # or serve locally at http://localhost:8000
```

Edit `index.html` directly and reload the page to see changes.

## Using with Claude Code

This project includes a `CLAUDE.md` that gives Claude Code full context.

```bash
claude    # Start Claude Code — reads CLAUDE.md automatically
```

## License

MIT — see [LICENSE](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
