---
name: creating-typo3-projects
description: Use when setting up a new customer project from the ps14-typo3 template - collects the project data, runs bin/create-system.sh (clone, customer branch, DDEV, site config, install, build, template data, local MCP, verification), then lints, commits and reports
---

# Creating TYPO3 Projects from the Template

## Overview

The main repo `ps14-typo3` holds the template on `main`. Every customer
project lives on a long-lived customer branch (e.g. `kist-escherich`) in its
own clone (e.g. `~/www/kist-escherich-com-v14`).

`bin/create-system.sh` does all mechanical steps and is not interactive. This
skill collects the data, gets confirmation, runs the script, fixes errors,
commits and reports.

**Core principle:** The script does the work, you do the decisions. Never
change the template, never print the MCP key, ask before anything the user
did not confirm.

Placeholders: **`<template>`** is the template clone (`~/www/ps14-typo3`),
**`<dir>`** the new project directory, **`<name>`** its DDEV project name,
**`<branch>`** the customer branch.

## Steps

### 1. Collect the data

Ask for the live URL first and derive proposals from it:

| Value | Option | Proposal (live URL `https://www.kist-escherich.com/`) |
|---|---|---|
| Live URL | `--live-url` | — (required, `https://<host>/`) |
| Staging URL | `--staging-url` | `https://staging.kist-escherich.com/` (optional; without it there is no `Production/Staging` variant) |
| Customer name | `--title` | — (required, becomes `websiteTitle` and `sitename`) |
| DDEV name | `--name` | `kist-escherich-com-v14` (host without `www.`, dots → `-`, suffix `-v14`) |
| Directory | `--dir` | `~/www/<name>` |
| Customer branch | `--branch` | `kist-escherich` (host without `www.` and TLD) |
| MCP user | `--mcp-user` | `1` (admin of the template data) |

`--name` and `--branch` allow only `[a-z0-9-]`.

### 2. Confirm

Show all values as a table and the exact script call. Start only after the
user confirms.

### 3. Check the template

In `<template>`:

- `git branch --show-current` is `main` and `git status --short` is empty —
  the project is cloned from `main`, unmerged feature branches are missing.
- DDEV project of the template is running (`ddev describe`) — the script
  exports its database.
- `<dir>` does not exist and `ddev list` does not know `<name>` (the script
  checks this too and aborts without changes).

### 4. Run the script

From `<template>`, in the background (takes about two minutes):

```bash
bin/create-system.sh \
    --dir <dir> --name <name> --branch <branch> \
    --title '<customer name>' \
    --live-url https://www.example.com/ \
    [--staging-url https://staging.example.com/] \
    [--mcp-user 1]
```

Steps: `clone` → `configure` → `start` → `install` → `build` → `data` →
`setup` → `mcp` → `verify`. The output is one line per step; details are in
`<dir>/temp/create-system.log`.

On `FEHLER`:

1. Read the last lines of the log (the script prints them).
2. Find and fix the cause. Changes to the script belong on a feature branch
   of the template, not in the project.
3. Continue with the same options plus `--from <step>`. Every step from
   `configure` on can be repeated.

### 5. Lint and commit

In `<dir>`:

```bash
ddev exec npm run lint
git add -A && git status --short   # only DDEV, README, site and system config
git commit -m "chore: configure project <name>"
```

Follow the commit rules in `CLAUDE.md` (fix lint findings first, attribution
lines). `additional.php`, `temp/`, the SQL dump and `fileadmin` are ignored
and must not appear in the commit. Never push.

### 6. Report

- URLs: `https://<name>.ddev.site/` and `/typo3/`.
- Commit on `<branch>`; pushing is up to the user.
- MCP (`in2mcp`) is registered locally for `<dir>` and becomes active once
  Claude is started in `<dir>`.
- `.env` was created from `.env.ddev` (`TYPO3_CONTEXT=Development`).
- Open points, e.g. real content, deployment: hosts in `deploy.php` still
  hold the examples from `main` (see the Deployment section of `README.md`).

## Removing a project

Only after the user approves (e.g. a test project):

```bash
cd <dir> && claude mcp remove in2mcp --scope local
ddev delete -O --yes <name>
rm -rf <dir>
```

## Common Mistakes

| Mistake | Fix |
|---|---|
| Template on a feature branch | Clone source is `main`; merge first or wait |
| Printing or logging the MCP key | The script passes it straight to `claude mcp add`; never call `in2mcp:apikey` yourself |
| Registering MCP for staging or production | Local DDEV only (`CLAUDE.md`) |
| `additional.php` overwritten by DDEV | It must not contain the DDEV marker string; source is `config/system/additional.ddev.php` |
| DDEV name "free" but `ddev start` fails | A stale entry from a deleted directory: `ddev delete -O --yes <name>` after asking |
| Fixing the script inside the new project | Fix it in `<template>` on a feature branch, then `--from <step>` |
| Static 404 for every page | `public/.htaccess` symlink missing; rerun `--from data` |
