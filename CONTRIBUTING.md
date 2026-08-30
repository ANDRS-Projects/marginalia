# Contributing to Marginalia

Thanks for your interest in contributing! Marginalia is intentionally small —
one static HTML file — so contributing is low-ceremony.

## Development Setup

```bash
git clone https://github.com/ANDRS-Projects/marginalia.git
cd marginalia
./setup.sh
```

That's it — there's no dependency install, no build step, and no test suite.
Edit `index.html` directly and reload the page in your browser to see your
changes. See [CLAUDE.md](CLAUDE.md) for an architecture overview of the file.

## Branch & PR Workflow

1. Fork the repo and create a feature branch off `main`:
   `git checkout -b my-change`
2. Make your change in `index.html`.
3. Test manually in at least one browser (see "Manual Testing" below).
4. Open a pull request describing what changed and why. Screenshots or a
   short screen recording are appreciated for anything visual.

Please don't push directly to `main` — always work from a branch and open a
PR, even for small changes.

## Code Style Notes

- Keep everything in `index.html`. This project's whole appeal is being a
  single, dependency-free file you can download and open — please don't
  introduce a build step, a package manager, or split it into multiple files
  unless discussed in an issue first.
- Match the existing style: vanilla JS (no frameworks), CSS custom properties
  for theming (see the `:root` block), IIFEs to scope each feature's script.
- Respect the privacy model: notes must stay in `localStorage` by default,
  with no new network calls or third-party analytics/tracking added.
- If you touch the optional `window.claude.use('artifact')` sync hook, keep
  it capability-detected and no-op everywhere that API isn't present.

## Manual Testing

Since there's no automated test suite, please manually verify before
submitting a PR:

- The page loads with no console errors, both as a local file (`open
  index.html`) and served (`python3 -m http.server`).
- The breathing circle cycles, the quote rotates/advances, and book shuffle
  works.
- Sticky notes can be added, edited, and deleted, and survive a page reload
  (i.e. `localStorage` persistence still works).
- No regressions in a browser without `window.claude` defined (the default
  case — sync should silently stay off).

## Reporting Issues

Please use the issue templates under `.github/ISSUE_TEMPLATE/` — a bug report
or feature request template will be offered when you open a new issue.
Include your browser/OS and steps to reproduce for bugs.

## Using Claude Code

This repo includes a [CLAUDE.md](CLAUDE.md) with accurate, verified commands
and architecture notes. If you're using Claude Code, just run `claude` from
the repo root — it reads `CLAUDE.md` automatically and will have full context
on the single-file structure described above.
