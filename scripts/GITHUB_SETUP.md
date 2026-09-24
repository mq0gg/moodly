# Moodly — GitHub Setup

Follow these in order. Steps 1 and 2 are scripted; Step 3 is a short manual
part (GitHub has no CLI command for it); Step 4 is scripted again.

## Prerequisites

- [GitHub CLI](https://cli.github.com) installed, then `gh auth login`
- `jq` installed (`brew install jq` / `apt install jq` / `choco install jq`)
- This `scripts/` folder (setup-github.sh, add-to-board.sh, backlog.json)

## Step 1 — Create the repo and push the v0.1 code

```bash
gh repo create YOUR_USERNAME/moodly --public --clone=false \
  --description "Free coffee-mood recipe tool with a SipSense quiz"

cd moodly   # the folder from moodly-v0.1-foundation.zip
git init
git add .
git commit -m "v0.1 foundation: content model, Docker Compose, CI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/moodly.git
git push -u origin main
```

## Step 2 — Labels, milestones, and all 30 backlog issues

```bash
cd scripts
chmod +x setup-github.sh
./setup-github.sh YOUR_USERNAME moodly
```

This creates 5 labels (priority + size), the 5 release milestones with
their dates from the Release Plan, and all 30 issues (B-01 to B-30) with
their WBS reference, FR/NFR trace, and milestone. Safe to re-run — it
skips anything that already exists.

## Step 3 — Create the Project board (manual, ~2 minutes)

GitHub's CLI can add issues to a board and move them, but it can't set up
a custom Status column list — that one part is faster by hand:

1. Go to `https://github.com/users/YOUR_USERNAME/projects` → **New project** → **Board**.
   Name it "Moodly".
2. Click the **Status** column header → **Edit field**.
3. Delete the default "Todo" option.
4. Add two new options: **Backlog** and **Ready**, and drag all four so
   the order reads: **Backlog → Ready → In Progress → Done**.
   (Names must match exactly — the script in Step 4 looks them up by name.)
5. Click the **⋯** menu on the board → **Workflows** → turn on
   **"Set field on close"**: when an issue closes, set Status to **Done**.
   (Optional, but it keeps the board honest without manual dragging.)
6. Open **Settings** on the board (⋯ menu) → confirm it's linked to
   your `moodly` repo, so newly added issues resolve correctly.
7. Copy the board's URL — the number at the end (e.g. `.../projects/3`)
   is your `PROJECT_NUMBER` for Step 4.

## Step 4 — Add every issue to the board, in the right column

```bash
chmod +x add-to-board.sh
./add-to-board.sh YOUR_USERNAME PROJECT_NUMBER moodly
```

All 30 issues land on the board: the 11 v0.1 issues (B-01 to B-11) go
straight to **Ready**, everything else starts in **Backlog** — matching
the Backlog document's Now/Next/Later roadmap.

## From here

- Pull the top **Ready** item, drag it to **In Progress** (WIP limit: 2 —
  the Backlog document's Kanban rule).
- Move it to **Done** when it meets the Definition of Done
  (`Moodly_Decision_Log_and_DoD.docx` §1) and close the issue.
- As you finish v0.1 items, drag the next release's Backlog items into
  Ready.
