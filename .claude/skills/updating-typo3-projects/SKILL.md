---
name: updating-typo3-projects
description: Use when bringing a customer project (customer branch of the ps14-typo3 main repo in its own clone) up to date with the template on main - covers fetching main, one-time migrations of legacy project states (e.g. a separate ps14_site clone), merging, dependencies, generated artifacts, TYPO3 setup and verification
---

# Updating TYPO3 Projects from the Template

> **Status: skeleton.** Built from the first project update (kist-escherich,
> 2026-11-20). Refine it during the next real migration and replace this note.

## Overview

The main repo `ps14-typo3` holds the template on `main`. Every customer
project lives on a long-lived customer branch (e.g. `kist-escherich`) in its
own clone (e.g. `~/www/kist-escherich-com-v14`). Updating a project means
merging `main` into the customer branch and bringing the local environment in
line with it.

**Core principle:** Never lose project state. Move anything that would block
the merge to `temp/` instead of deleting it, keep customer values on
conflicts, and prove the project works (HTTP + lint) before calling it done.

Placeholders: **`<project>`** is the project clone and DDEV project name
(e.g. `kist-escherich-com-v14`), **`<branch>`** the customer branch
(e.g. `kist-escherich`), **`<template>`** the template clone
(`~/www/ps14-typo3`).

## Steps

Ask before each step that goes beyond the user's request (see `CLAUDE.md`).

### 1. Preconditions

- `git status --short` is empty and `git branch --show-current` is `<branch>`.
- DDEV project is running (`ddev describe`).
- The template's `main` contains what should be rolled out (merged, not only
  on a feature branch).

### 2. Fetch `main`

`git fetch` over SSH may fail in Claude's environment. Fetch from the local
template clone instead:

```bash
git fetch <template> main
git log --oneline <branch>..FETCH_HEAD   # what will be merged
```

### 3. One-time migrations of legacy states

Check each item; skip what does not apply. Add new items here when a template
change needs manual steps in existing projects.

- **`temp/` missing** → `mkdir temp` (gitignored, permanent place for backups).
- **Separate `ps14_site` clone** (`packages/ps14_site/.git` exists; `ps14_site`
  is part of the main repo since 2026-11-20). The merge aborts while the clone
  is in the way.
  1. In the clone: no changes (`git status --short`), no stash
     (`git stash list`), no unpushed commits
     (`git log --branches --not --remotes`).
  2. Compare its `HEAD` with the state imported on `main`. If the clone holds
     customer-specific commits (e.g. an old customer branch of
     `ps14-site.git`), **stop and ask** — these changes must be ported
     manually.
  3. `mv packages/ps14_site temp/ps14_site-repo`
  4. Never modify `ps14-site.git` or its branches.
- **Legacy project on the old template** (customer-specific branch based on
  the old template, in the main repo and/or as a customer branch of
  `ps14-site.git`, e.g. `kist-escherich`, `kist-escherich-hyjoin`,
  `haus-schnetzer-at`). There is no common base with the new `main`, so it
  cannot simply be merged.
  1. Clone each legacy customer branch read-only into `temp/`
     (e.g. `temp/<branch>-legacy-main`, `temp/<branch>-legacy-site`); fetch
     from a local clone if SSH fails.
  2. Create the new customer branch from `main` (see the project creation
     skill) instead of merging.
  3. Port the customer changes by comparing with the clones in `temp/`
     (site config, DDEV, `ps14_site` overrides, assets, translations). Ask
     which changes to take over.
  4. Never modify the legacy repos or branches — they hold the customizations
     of all sites.
  5. Details are worked out during the first real legacy update.

### 4. Merge

```bash
git merge FETCH_HEAD -m "chore: merge main into <branch>"
```

- Normal merge, no squash, no rebase — the customer branch keeps its history.
- Conflicts: keep the customer values (DDEV project name, hostnames,
  `config/sites/*/config.yaml`: `websiteTitle`, `baseVariants`, robots.txt),
  take everything else from `main`.
- After a legacy migration (step 3), compare the merged files with the backup:
  `diff -r --exclude=.git temp/ps14_site-repo packages/ps14_site`
  (ignored build artifacts like the iconfont may differ).

### 5. Dependencies and generated files

- `ddev composer install` (installs according to the merged `composer.lock`).
- `package-lock.json` changed → `ddev npm install` (ask first, not on the
  allowed list).
- Iconfont: `ddev exec node build/build-iconfont.js`.
- `public/.htaccess` must be a symlink to `htaccess/.htaccess-ddev`;
  without it Apache answers every TYPO3 URL with a static 404.

### 6. TYPO3

```bash
ddev typo3 extension:setup
ddev typo3 upgrade:list      # run wizards only after asking
ddev typo3 cache:flush
```

### 7. Verify

- HTTP 200 for `/de/`, `/en/`, `/typo3/` and the example pages below
  "Modules" [29].
- `ddev composer show ps14/ps14_site` → `14.x-dev` (path package).
- `ddev exec npm run lint` without findings.

### 8. Clean up

- Delete backups in `temp/` only after the user approves.
- Report the merge commit and open points to the user.

## To be refined during the next migration

- Updating shared packages (`ddev composer update 'ps14/*'`, needs
  confirmation) — part of every project update or separate?
- TYPO3 major upgrades of a project: order with the
  `migrating-typo3-extensions` skill, upgrade wizards, database backup before.
- Content changes required by template updates → only via MCP (`in2mcp`).
- Legacy projects on the old template (step 3): naming in `temp/`, how to
  find all customer-specific changes (`git log`/`diff` against the old
  template), order of porting, what to do with customer commits in
  `ps14_foundation` customer branches.
- Hand-over to deployment once it exists.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Merging while `packages/ps14_site` is still a separate clone | Move it to `temp/` first (step 3) |
| Merging a legacy customer branch based on the old template into `main` | Clone it to `temp/`, start from `main`, port changes (step 3) |
| Changing or pushing legacy customer branches | Read-only — they are the only copy of the customer changes |
| Deleting the old clone instead of moving it | Always back up to `temp/`, delete after approval |
| Squash-merging `main` into the customer branch | Normal merge; squash is only for feature branches into `main` |
| Taking `main`'s hostnames or site title on conflicts | Customer values win in DDEV and site config |
| Treating the static 404 as a routing problem | Check the `public/.htaccess` symlink first |
