#!/usr/bin/env bash
set -euo pipefail

# Marginalia — First-time setup
# Usage: ./setup.sh
#
# Marginalia is a single self-contained index.html file: no dependencies,
# no build step, no server required. This script just gets it open in your
# browser the easiest way available on your system.

echo "=== Marginalia Setup ==="

# Resolve the directory this script lives in, so it works regardless of cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f index.html ]; then
  echo "Error: index.html not found in $SCRIPT_DIR — did you clone the full repo?"
  exit 1
fi

echo "No dependencies to install — this is a single static HTML file."
echo ""

# Try to open it directly in the default browser (fully offline-capable
# except for a Google Fonts CDN request).
OPENED=0
if command -v open >/dev/null 2>&1; then
  echo "Opening index.html in your default browser..."
  open "index.html" && OPENED=1
elif command -v xdg-open >/dev/null 2>&1; then
  echo "Opening index.html in your default browser..."
  xdg-open "index.html" && OPENED=1
elif command -v start >/dev/null 2>&1; then
  echo "Opening index.html in your default browser..."
  start "index.html" && OPENED=1
fi

if [ "$OPENED" -eq 0 ]; then
  echo "Could not auto-detect a way to open a browser on this system."
  echo "Open index.html manually, or serve it locally (see below)."
fi

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "  - It's already open (if your browser supports it). Otherwise:"
echo "      open index.html          # macOS"
echo "      xdg-open index.html      # Linux"
echo "  - Prefer a local server? Run:"
echo "      python3 -m http.server 8000"
echo "    then visit http://localhost:8000"
echo "  - Notes are saved only in this browser's localStorage — nothing"
echo "    is sent anywhere, and nothing syncs between browsers or devices"
echo "    unless you're viewing this inside Claude's Artifact platform."
echo "  - Using Claude Code? CLAUDE.md has all the context."
