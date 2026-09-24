#!/usr/bin/env bash
# Moodly — GitHub setup: repo, labels, milestones, all 30 backlog issues.
# Requires: gh CLI (https://cli.github.com), logged in (`gh auth login`), jq.
#
# What this script does NOT do: create the Project (v2) board itself, or
# set its Status column options to Backlog/Ready/In Progress/Done. GitHub's
# CLI has no command for editing a single-select field's options, and the
# underlying GraphQL mutation replaces the whole field in one call — risky
# to script blind. That part is 6 clicks in the UI; Step 3 below walks
# through it exactly, then this script's Step 4 adds every issue to the
# board and sets its column for you.
#
# Usage:
#   chmod +x setup-github.sh
#   ./setup-github.sh YOUR_GITHUB_USERNAME [repo-name]

set -euo pipefail

OWNER="${1:?Usage: ./setup-github.sh YOUR_GITHUB_USERNAME [repo-name]}"
REPO="${2:-moodly}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKLOG_JSON="$SCRIPT_DIR/backlog.json"

command -v gh >/dev/null || { echo "gh CLI not found — install from https://cli.github.com"; exit 1; }
command -v jq >/dev/null || { echo "jq not found — install it (e.g. 'brew install jq' or 'apt install jq')"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Not logged in — run 'gh auth login' first"; exit 1; }

echo "==> Step 1: repository"
if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "    $OWNER/$REPO already exists, reusing it."
else
  gh repo create "$OWNER/$REPO" --public --description "Free coffee-mood recipe tool with a SipSense quiz" --clone=false
  echo "    Created $OWNER/$REPO"
fi

echo "==> Step 2: labels"
declare -A LABELS=(
  ["priority:must"]="d73a4a"
  ["priority:should"]="fbca04"
  ["size:S"]="c5def5"
  ["size:M"]="1d76db"
  ["size:L"]="0052cc"
)
for name in "${!LABELS[@]}"; do
  gh label create "$name" --repo "$OWNER/$REPO" --color "${LABELS[$name]}" --force >/dev/null
done
echo "    5 labels ready (priority:must, priority:should, size:S/M/L)"

echo "==> Step 3: milestones (v0.1 to v1.1 — dates from the Release Plan)"
declare -A MILESTONES=(
  ["v0.1"]="2026-09-13"
  ["v0.2"]="2026-09-17"
  ["v0.3"]="2026-09-20"
  ["v1.0"]="2026-09-24"
  ["v1.1"]="2026-09-29"
)
for m in "${!MILESTONES[@]}"; do
  existing=$(gh api "repos/$OWNER/$REPO/milestones?state=all" --jq ".[] | select(.title == \"$m\") | .number" 2>/dev/null || true)
  if [ -z "$existing" ]; then
    gh api "repos/$OWNER/$REPO/milestones" -f title="$m" -f due_on="${MILESTONES[$m]}T00:00:00Z" >/dev/null
    echo "    Created milestone $m (due ${MILESTONES[$m]})"
  else
    echo "    Milestone $m already exists, skipping"
  fi
done

echo "==> Step 4: 30 backlog issues"
jq -c '.[]' "$BACKLOG_JSON" | while read -r item; do
  id=$(echo "$item" | jq -r '.id')
  title=$(echo "$item" | jq -r '.title')
  wbs=$(echo "$item" | jq -r '.wbs')
  trace=$(echo "$item" | jq -r '.trace')
  priority=$(echo "$item" | jq -r '.priority')
  size=$(echo "$item" | jq -r '.size')
  release=$(echo "$item" | jq -r '.release')

  # Idempotent: skip if an open or closed issue with this ID already exists.
  existing=$(gh issue list --repo "$OWNER/$REPO" --state all --search "\"$id\" in:title" --json number --jq '.[0].number' 2>/dev/null || true)
  if [ -n "$existing" ] && [ "$existing" != "null" ]; then
    echo "    $id already exists as #$existing, skipping"
    continue
  fi

  body=$(cat <<EOF
**WBS:** $wbs
**Trace:** $trace
**Release:** $release

_From the Moodly Backlog and Roadmap (Phase 1)._
EOF
)

  gh issue create \
    --repo "$OWNER/$REPO" \
    --title "$id — $title" \
    --body "$body" \
    --label "priority:$priority" \
    --label "size:$size" \
    --milestone "$release" \
    >/dev/null

  echo "    Created $id"
done

echo ""
echo "Done. $(gh issue list --repo "$OWNER/$REPO" --state all --json number --jq 'length') issues in $OWNER/$REPO."
echo "Next: create the Project board (manual steps in GITHUB_SETUP.md Step 3),"
echo "then come back and tell Claude the board's URL to auto-add every issue."
