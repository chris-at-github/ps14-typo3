---
name: migrating-typo3-projects
description: Use when taking over an existing TYPO3 installation of an older version (v10–v13, often classic mode) into the ps14 template (v14) - covers inventory, the two-step plan (functionality, then data and extensions), porting into ps14_site, pulling production data, the data takeover with ps14_migration, known pitfalls, verification and go-live cleanup
---

# Migrating TYPO3 Projects into the Template

> **Status: first version.** Built from the KIST + ESCHERICH migration
> (v12 → v14, 2026-11). Refine it with the next project.

## Overview

An old installation is not merged into the template, it is **ported** once:
its functionality goes into `ps14_site` of a new customer branch, its data is
taken over with the package `ps14/ps14_migration`. Afterwards the project is
kept up to date with `updating-typo3-projects`.

**Core principle:** Never lose data and never guess. Read the old project and
the production data before deciding, protect everything a later step still
needs, and prove each step (HTTP, markup, log, lint) before moving on.

References (do not repeat them, read them):
- Plan and decisions of the tool: `docs/plans/migration-tool.md`
- Package: `packages/ps14_migration/Readme.md` (repo `ps14-migration`)
- Reference project: KIST (`kist-escherich-com-v14`), plans
  `docs/plans/kist-v14-functionality.md`, `kist-v14-optimizations.md`,
  `migration-kist-v14.md`

Placeholders: **`<old>`** old project (e.g. `~/www/kist-escherich-com`),
**`<project>`** new clone (e.g. `~/www/kist-escherich-com-v14`, created with
`creating-typo3-projects`), **`<provider>`** DDEV provider for production
(e.g. `prod-v12`).

## Steps

Ask before each step that goes beyond the user's request (see `CLAUDE.md`).
Plans live in `<project>/docs/plans/`, one feature branch per task.

### 1. Inventory

- Extensions of `<old>`: key, version, author (own vs. third party), git repo.
- Content in production: `CType`/`list_type` with counts, used layouts,
  frame classes, variants (read-only SQL on the **production** dump, not on
  the local old instance — its data differs).
- Old ps14_foundation fields/tables still in use, page ids for Site Settings,
  credentials in plain text (never copy them).
- Write the findings into the plan (feature inventory, field mapping).

### 2. Plan with two steps

- **Step 1 – functionality**: port into `ps14_site`; data migration only
  prepared (wizards, SQL).
- **Step 2 – data and extensions**: data takeover, third-party and own
  extensions, Content Blocks instead of Elements, optimisation.
- Ask for the decisions up front: old markup vs. template markup, asset
  structure (Vite entrypoint per old file?), field prefix `tx_site_`,
  wizards for every data change. Collect improvements in a separate
  optimisation list instead of implementing them.

### 3. Port the functionality (step 1)

- Assets: old SCSS/JS to `Resources/Private/Assets/`, one Vite entrypoint per
  old file, critical CSS inline (`vite:asset inlineCss`, absolute URLs via
  `renderBuiltUrl`), JS to ES modules, globals declared in ESLint.
- Templates: old markup overrides foundation v14; take template parts only
  where they fit without effort. Park extension files (templates under
  `Resources/Private/Extensions/`, TypoScript in a subfolder that is not
  imported) until step 2.
- Check every template package of the template that registers its own
  `templateRootPaths` (e.g. `ps14_menu` with key 108): override with a higher
  key if the old markup is required.
- TSconfig: `[field('CType') …]` → `….types.<CType>`; fixed page ids → Site
  Settings (own set in `ps14_site`).

### 4. Production data

- DDEV provider `.ddev/providers/<provider>.yaml` with a dump script that
  runs on the server (credentials: `.env` first, then `additional.php`;
  password never on the command line). Reserve `prod` for the new production.
- Test the provider without a dump first (check mode, `rsync -n`).
- Every pull replaces `be_users` and with it the in2mcp API key (hash in
  `be_users.in2mcp_apikey`). Afterwards create a new key and register the
  server again, passing the key through a shell variable — never print it:
  `KEY=$(ddev typo3 in2mcp:apikey <user> | tr -d '\r' | grep -oE
  '^1\.[^[:space:]]+')` (the key contains special characters), then
  `claude mcp remove in2mcp -s local` and `claude mcp add --transport http
  --scope local in2mcp <url>/typo3/mcp --header "X-Api-Key: $KEY"`. A running
  session needs a restart.

### 5. Data takeover

```bash
ddev composer require --dev 'ps14/ps14_migration:^14.0@dev'   # once
ddev pull <provider> --skip-files -y                           # fresh dump
ddev exec vendor/bin/ps14-migrate
```

- **Never** run `extension:setup` or `update-system.sh` on an old database
  first (see pitfalls).
- Before the first real run: `ddev typo3 ps14:migration:update-schema
  --dry-run` and compare every type change with the data (VARCHAR → INT,
  shorter columns). Convert values in `config/migration/sql/pre/`, or protect
  the column in `MIGRATION_SKIP_COLUMNS`.
- The TypoScript records (`sys_template`) of the old project are deleted by
  the generic post SQL of `ps14_migration`
  (`0030_disable_sys_template.sql`); the template loads its TypoScript via
  site sets. Port their content into `ps14_site` before (inventory).
- Generic wizards/SQL belong into `ps14_migration`, project-specific ones into
  `ps14_site/Classes/Upgrades/` and `config/migration/sql/`.
- Project wizards never extend or use classes of `ps14_migration`: the
  package is require-dev, the deployment installs `--no-dev`, and a missing
  parent class breaks the DI container. Copy a base class into `ps14_site`
  instead (e.g. `AbstractElementsMigration`).
- Every field change is a **wizard**, even a plain column-to-column copy.
  SQL only for steps before the schema update (pre) and for cleanup (post).
- Project wizards run after the package wizards only if `ps14_site` suggests
  the package (`"suggest": {"ps14/ps14_migration": "…"}` in its
  `composer.json`, then `ddev composer update ps14/ps14_site`); check the order
  with `ddev typo3 upgrade:list --all`.
- Elements (`tx_foundation_domain_model_elements`) → Content Block
  Collection: keep the element uid as item uid, so nested content
  (`tt_content.tx_foundation_parent`) and file references stay valid; set the
  parent table (`tx_foundation_parent_table`) and recalculate the counter of
  the inline field (old counters can be wrong). See
  `.claude/rules/typo3/content-blocks.md`.
- A run always starts from a fresh dump; a second run on a migrated database
  is refused. The marker is written at the end, so a **failed** run can be
  repeated on the same database — keep every SQL file repeatable.

### 6. Verify

- Script output: no failed wizard, `upgrade:list` empty, check URLs 200.
- While developing a wizard, test it without a fresh dump:
  `ddev typo3 ps14:migration:update-schema --skip=<table>.<column>` (same
  skips as `MIGRATION_SKIP_COLUMNS`), `ddev typo3 upgrade:run <identifier>`,
  `ddev typo3 upgrade:mark:undone <identifier>` to repeat it. The final proof
  is always `ps14-migrate` on a fresh dump (wizard order, `updateNecessary()`
  before other wizards ran).
- HTTP status of all pages of the main, meta and footer navigation, old vs.
  new; open every page type and every used CType at least once.
- Markup samples per CType against the old site; TYPO3 log without errors.
- Compare markup with the live site per element id and in every language:
  normalise whitespace, hide SVGs, compare JSON-LD as parsed data instead of
  text. Old bugs that are fixed on purpose go into the plan as deviations.
- Browser check by the user (layout, JS); later visual regression with
  Playwright.

### 7. Go-live and cleanup

- Final run with `ps14-migrate --go-live` (skips `DEV*` SQL).
- Remove project wizards, `config/migration/` and
  `composer remove --dev ps14/ps14_migration` in one commit.
- Remove only the old sources that the migration replaced; keep the rest
  until its own step.
- Before the first deploy: make sure `extension:setup` (run by
  `update-system.sh`) changes no protected column.

## Known pitfalls

| Symptom | Cause | Solution |
|---|---|---|
| Every TYPO3 CLI command fails with `Unknown column 'user_settings'` | `_cli_` login writes `be_users.user_settings` (TYPO3 14.2) before the schema exists | `ps14-migrate` (schema update without login) |
| Values like `container` or element types become `0` | Schema change VARCHAR → INT from TCA (select with numeric items) | Convert in pre SQL (e.g. `container` → `10`) or `MIGRATION_SKIP_COLUMNS`; fix the definition |
| `sys_reaction`: "only one auto column" | Table created by EXT:external_import without `uid` | Generic pre SQL in `ps14_migration` |
| Index error in the first schema pass | Index on a column added in the same pass | Second pass (automatic in `ps14-migrate`) |
| HTTP 500 on pages with a CType, `Too few arguments … __construct()` | Data processor with constructor dependencies not `public` in `Services.yaml`. The message names the class that **declares** the constructor — often the parent (`TextImageProcessor extends ModuleProcessor` reports `ModuleProcessor`) | Check every subclass (`grep -rn 'extends .*Processor' Classes/DataProcessing`), make them public in the package, release |
| Menus/elements with template markup instead of the old one | Template package registers its own `templateRootPaths` | Override with a higher key in `ps14_site` |
| A project wizard never ran but is marked done | `upgrade:run` asks `updateNecessary()` of **all** wizards before running the first and marks the others done | Load order (`ps14_site` suggests `ps14/ps14_migration`) **and** `updateNecessary()` must already be true before the package wizard created its data (e.g. count source rows whose target is still missing) |
| `Illegal mix of collations` in post SQL | New tables (`utf8mb4_unicode_520_ci`) compared with old ones (`utf8mb4_unicode_ci`) | Wizard instead of SQL; no string comparison across tables |
| Pre SQL fails on a repeated run (`Truncated incorrect DECIMAL value`) | The column is already INT after the first run | `WHERE CAST(col AS CHAR) = '…'` |
| Content Block: `field "…" is missing the required "type"` | `useExistingField` on a field created in another extension's TCA overrides | Add it with `addFieldsToPalette` (see `content-blocks.md`) |
| MCP fails after `ddev pull` with `Dynamic Client Registration rejected (HTTP 404)` | API key in `be_users` was replaced by the production data; the client falls back to OAuth | New key + register again (step 4) |
| Wizard counts higher than expected | Wizards remove all restrictions (deleted/hidden rows included) | Expected; compare with `deleted = 0` |
| Different numbers than in the old local site | Local old instance has an older data state | Always compare against the production dump |
| Wizard copies rows, but the target only has empty records with new uids; a second run skips them (uids taken) | DBAL 4: `Table::getColumns()` returns a list without column names as keys, the intersection with the row is empty | Fixed column list per table; repeat on a fresh dump |
| `Truncated incorrect DECIMAL value: ''` in a wizard UPDATE | Strict mode: INT column (e.g. inline counter) compared with `''` | Conditions per field type: numbers with `0`, strings with `''` |
| Translated elements render empty, the default language works | v12 elements of a translation selected the translated record directly (e.g. address 103 instead of 14); Extbase accepted it | Processor resolves the selection via `l10n_parent` to the original, then applies the language overlay |
| `50.97784000` instead of `50.97784` in links or JSON-LD | v12 Extbase models returned floats, raw rows return the DECIMAL string | Cast to float in the processor |
| `settings.php` suddenly contains local values (e.g. in2mcp `mcpServer = 1`) | When TYPO3 writes extension configuration (e.g. after installing an extension), it stores the effective values, including those from `additional.php` | Check the diff of `settings.php` before every commit; environment values only in `additional.php` |
| A later step needs an old column that no extension defines anymore (e.g. `tt_address.record_type` of contact persons) | Column is in no TCA/SQL and disappears when the schema is cleaned up | Keep it temporarily in `ps14_site` as `passthrough` TCA plus SQL until the step takes it over |
| Remote PHP script stops after the first `exec()` | Script read from STDIN (`php -- … < file`), child consumes STDIN; `STDERR` undefined | Copy the script into a temp file on the server first |

## Common Mistakes

- Analysing the local old database instead of production.
- Running `extension:setup` "just once" on the old database.
- Implementing improvements during the port instead of listing them.
- Changing content via SQL outside the migration: content changes go
  through MCP, data migrations through `ps14-migrate` (reproducible).
- Committing secrets from the old project (`.env`, credentials in TypoScript).
