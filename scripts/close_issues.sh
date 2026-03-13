#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-Split-Naira/SplitNaira}"
START="${2:-1}"
END="${3:-20}"
COMMENT="${4:-Superseded by issues created by mimijuwonlo-commits}"
GH_ARGS=("-R" "$REPO")
GH_BIN="${GH_BIN:-gh}"

if ! command -v "$GH_BIN" >/dev/null 2>&1; then
  if [[ -x "/mnt/c/Program Files/GitHub CLI/gh.exe" ]]; then
    GH_BIN="/mnt/c/Program Files/GitHub CLI/gh.exe"
  elif [[ -x "/c/Program Files/GitHub CLI/gh.exe" ]]; then
    GH_BIN="/c/Program Files/GitHub CLI/gh.exe"
  else
    echo "gh CLI not found in PATH. Set GH_BIN or add gh to PATH." >&2
    exit 1
  fi
fi

for i in $(seq "$START" "$END"); do
  "$GH_BIN" issue close "${GH_ARGS[@]}" "$i" -c "$COMMENT" || true
  echo "Closed issue #$i"
done