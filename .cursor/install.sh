#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for video-digest.
#
# Prepares the two toolchains the project needs on top of the base image
# (Node, Python 3.12, git and curl already ship in Cursor's default image):
#   - Bun 1.3.14 (pinned to match CI and package.json engines)
#   - uv (manages the isolated Python 3.12 transcript runtime)
# then installs locked JS dependencies and builds the managed Python runtime.
#
# Safe to run repeatedly: every step is guarded and converges without
# rewriting the lockfile.
set -euo pipefail

BUN_VERSION="1.3.14"

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$HOME/.local/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

log() { printf '==> %s\n' "$1"; }

# Bun: install the pinned version only when it is missing or mismatched.
if ! command -v bun >/dev/null 2>&1 || [ "$(bun --version 2>/dev/null || true)" != "$BUN_VERSION" ]; then
  log "Installing Bun ${BUN_VERSION}"
  curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_VERSION}"
else
  log "Bun ${BUN_VERSION} already present"
fi

# uv: install once; it self-manages Python and the transcript dependencies.
if ! command -v uv >/dev/null 2>&1; then
  log "Installing uv"
  curl -LsSf https://astral.sh/uv/install.sh | sh
else
  log "uv already present ($(uv --version))"
fi

# Expose both tools on the default PATH for every future shell, independent of
# shell-init sourcing. Best-effort: the ~/.bashrc entries written by the
# installers remain the fallback when sudo is unavailable.
if command -v sudo >/dev/null 2>&1; then
  for tool in bun bunx uv uvx; do
    tool_path="$(command -v "$tool" 2>/dev/null || true)"
    if [ -n "$tool_path" ]; then
      sudo ln -sf "$tool_path" "/usr/local/bin/$tool" 2>/dev/null || true
    fi
  done
fi

log "Installing locked JavaScript dependencies"
bun install --frozen-lockfile

# Prepare the managed Python 3.12 transcript runtime from the shipped uv.lock.
# Non-interactive consent is explicit via --yes; normal commands never do this.
log "Preparing the managed Python transcript runtime"
bun run video-digest setup --yes

log "Environment ready. Run 'bun run video-digest doctor' to verify."
