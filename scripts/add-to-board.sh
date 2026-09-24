#!/usr/bin/env bash
# Moodly — adds every issue to the Project (v2) board and sets its starting
# column: v0.1 issues -> Ready (already planned, first to pull); everything
# else -> Backlog. Run this AFTER creating the repo/issues (setup-github.sh)
# AND after creating the Project board by hand (see GITHUB_SETUP.md Step 3).
#
# Usage:
#   chmod +x add-to-board.sh
#   ./add-to-board.sh YOUR_GITHUB_USERNAME PROJECT_NUMBER [repo-name]
#
# PROJECT_NUMBER is the number in the board's URL:
#   https://github.com/users/YOU/projects/3  ->  3

set -euo pipefail

OWNER="${1:?Usage: ./add-to-board.sh YOUR_GITHUB_USERNAME PROJECT_NUMBER [repo-name]}"
PROJECT_NUMBER="${2:?Missing PROJECT_NUMBER -- the number at the end of the boards URL}"
REPO="${3:-moodly}"

command -v gh >/dev/null || { echo "gh CLI not found — install from https://cli.github.com"; exit 1; }
command -v jq >/dev/null || { echo "jq not found"; exit 1; }

echo "==> Reading the project's Status field"
FIELDS_JSON=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
STATUS_FIELD_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name=="Status") | .id')
if [ -z "$STATUS_FIELD_ID" ] || [ "$STATUS_FIELD_ID" = "null" ]; then
  echo "Couldn't find a 'Status' field on project $PROJECT_NUMBER. Did you complete Step 3 in GITHUB_SETUP.md?"
  exit 1
fi

get_option_id() {
  echo "$FIELDS_JSON" | jq -r --arg name "$1" '.fields[] | select(.name=="Status") | .options[] | select(.name==$name) | .id'
}
BACKLOG_ID=$(get_option_id "Backlog")
READY_ID=$(get_option_id "Ready")

if [ -z "$BACKLOG_ID" ] || [ -z "$READY_ID" ]; then
  echo "Couldn't find 'Backlog' and 'Ready' options on the Status field."
  echo "Check the option names match exactly (case-sensitive) — see GITHUB_SETUP.md Step 3."
  exit 1
fi

PROJECT_ID=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json --jq '.id')

echo "==> Adding issues and setting their starting column"
gh issue list --repo "$OWNER/$REPO" --state open --limit 100 --json number,title,url,milestone | \
  jq -c '.[]' | while read -r issue; do
    number=$(echo "$issue" | jq -r '.number')
    title=$(echo "$issue" | jq -r '.title')
    url=$(echo "$issue" | jq -r '.url')
    milestone=$(echo "$issue" | jq -r '.milestone.title // ""')

    item_id=$(gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$url" --format json --jq '.id')

    if [ "$milestone" = "v0.1" ]; then
      target_id="$READY_ID"; label="Ready"
    else
      target_id="$BACKLOG_ID"; label="Backlog"
    fi

    gh project item-edit \
      --id "$item_id" \
      --project-id "$PROJECT_ID" \
      --field-id "$STATUS_FIELD_ID" \
      --single-select-option-id "$target_id" \
      >/dev/null

    echo "    #$number ($milestone) -> $label"
  done

echo ""
echo "Done. Board: https://github.com/users/$OWNER/projects/$PROJECT_NUMBER"
