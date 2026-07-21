---
name: migrating-typo3-extensions
description: Use when updating/migrating a TYPO3 extension to a new major version - covers composer.json/ext_emconf.php metadata, automated code and config migration with typo3-rector and typo3-fractor, PHPStan static analysis, and functional verification in the environment
---

# Migrating TYPO3 Extensions to a New Version

## Overview

Updating a TYPO3 extension to a new major version means bringing its metadata and code
in line with the target Core API and the PHP version that release requires. Work in this
order: prepare a branch, fix the metadata by hand, let automated tools do the bulk of the
code/config migration, then verify — first statically (PHPStan), then functionally (boot
TYPO3 with the extension active). The automated tools do **not** catch everything; the
verification steps are where the real breaking changes surface.

Throughout this skill, **`<target>`** is the TYPO3 major you are migrating to
(e.g. `14`) and **`<prev>`** is the current major (e.g. `13`).

**Core principle:** Migrate on a dedicated branch, keep `composer.json` and
`ext_emconf.php` consistent, verify every dependency actually supports the target before
pinning it, and never trust a green tool run as "done" — prove the extension loads.

**Environment note:** Run all `php`/`composer`/tool commands through the project's PHP
environment. If they are not on the host but the project uses DDEV, prefix with `ddev`
(e.g. `ddev composer …`, `ddev exec vendor/bin/rector …`, `ddev typo3 …`).

## Migration Steps

### 1. Work on a dedicated branch

- Never migrate on `master`/`main` or the `<prev>`-line dev branch.
- Branch naming convention: `v<target>-dev` (e.g. `v14-dev`).
- Stage changed files with `git add`; leave `git push`/`git merge` to the user.

### 2. Verify dependency compatibility (research first)

Before touching any manifest, confirm which versions support the target TYPO3 major —
check each dependency on Packagist / its declared `typo3/cms-core` constraint, and match
`typo3/cms-core` itself to the project's root `composer.json` rather than guessing. Do
**not** carry over old version ranges.

Example: for a v14 target, `tt_address` v10 declares `typo3/cms-core: ^13.4.20 || ^14.0`,
so `^10.0` is the correct line; the previous `9.x` range would break install.

### 3. Update `composer.json`

- `require."typo3/cms-core"` → the target constraint from step 2 (e.g. `^14.3`).
- Set the PHP platform requirement to what the target TYPO3 major requires and the
  project stack mandates (e.g. `"php": "^8.4"`).
- Add/adjust third-party dependencies to their target-compatible line using the
  **Composer package name** (e.g. `tt_address` → `"friendsoftypo3/tt-address": "^10.0"`).
- Use a valid SPDX/Composer `license` identifier — `"proprietary"` for closed source
  (not `"closed"`).
- Keep `extra."typo3/cms".extension-key` set. Drop empty blocks (e.g. `"suggest": {}`).

### 4. Update `ext_emconf.php`

Keep it consistent with `composer.json` and clean up legacy noise:

- `version` → the new major baseline (e.g. `14.0.0`).
- `constraints.depends.typo3` → `<target>.0.0-<target>.99.99` (e.g. `14.0.0-14.99.99`).
- `constraints.depends.<dependency>` → the range matching the composer constraint
  (e.g. `tt_address` → `10.0.0-10.99.99`).
- Remove obsolete keys that modern TYPO3 ignores: `uploadfolder`, `clearCacheOnLoad`.
- Remove the auto-generated comment header block if it is stale or references an
  unrelated extension.

### 5. Run automated migration tools

Automate the code and configuration migration, but treat every proposed change as a
review item — the tools are broad and occasionally leave debris. Rector/Fractor config
files live at the project root; the migrated extension code is reviewed and committed in
the extension repo.

**PHP** — `ssch/typo3-rector`:
- Install: `composer require --dev ssch/typo3-rector`. If Composer refuses because
  locked packages must move, add `-W` (`--with-all-dependencies`).
- Create `rector.php` at the project root:
  ```php
  <?php
  declare(strict_types=1);
  use Rector\Config\RectorConfig;
  use Ssch\TYPO3Rector\Set\Typo3LevelSetList;

  return RectorConfig::configure()
      ->withPaths([__DIR__ . '/packages/<extension>'])
      ->withPhpSets(php84: true) // match the PHP the target requires
      ->withSets([Typo3LevelSetList::UP_TO_TYPO3_14]) // target major
      ->withImportNames(importShortClasses: false, removeUnusedImports: true);
  ```
- `vendor/bin/rector process --dry-run` → review the diff → `vendor/bin/rector process`.
- Re-run `process` until a final `--dry-run` reports **"Rector is done!"** — some rules
  need multiple passes; one run is often not idempotent.
- The v14 + PHP sets do **not** include dead-code removal. When a rule deletes a call
  (e.g. `PageDoktypeRegistry::add()` migrated to `$GLOBALS['TCA'][…]['allowedRecordTypes']`
  in `Configuration/TCA/Overrides/pages.php`), Rector can leave orphaned variables and
  now-unused `use` imports behind — clean those up by hand.
- Syntax-check with `php -l` and commit on `v<target>-dev`.

**Non-PHP (TypoScript/FlexForm/TSconfig/XLIFF)** — `a9f/typo3-fractor` (Rector v2/v3
only handles PHP):
- Install: `composer require --dev a9f/typo3-fractor`. Its installer plugin must be
  allowed: `composer config --no-plugins allow-plugins.a9f/fractor-extension-installer true`.
- Create `fractor.php` (namespaces `a9f\Fractor\Configuration\FractorConfiguration` and
  `a9f\Typo3Fractor\Set\Typo3LevelSetList`) scoped to the extension with
  `withSets([Typo3LevelSetList::UP_TO_TYPO3_14])`.
- `vendor/bin/fractor process --dry-run` → review → `vendor/bin/fractor process`.
- Fractor **re-serializes every file it touches**, so real migrations (removing the
  FlexForm `<TCEforms>` wrapper, dropping v14-removed TypoScript options) come mixed with
  large cosmetic reformatting: de-indented TypoScript condition bodies, `[END]` →
  `[end]`, added trailing newlines, reformatted XLIFF. Decide whether that noise is
  acceptable, and verify nothing was lost — confirm XLIFF `trans-unit` ids and
  `<source>` texts are unchanged and the XML still validates.

### 6. Static analysis with PHPStan

Rector/Fractor miss real breaking changes; PHPStan finds them in one pass. This is the
most valuable verification step.

- Install: `composer require --dev phpstan/phpstan phpstan/extension-installer
  saschaegerer/phpstan-typo3` (allow the plugin:
  `composer config --no-plugins allow-plugins.phpstan/extension-installer true`).
- Create `phpstan.neon` at the project root scoping `paths` to the extension's
  `Classes/`, `Configuration/`, `ext_*.php`; start at `level: 5`.
- Run `vendor/bin/phpstan analyse -c phpstan.neon --no-progress --memory-limit=1G`.
- If PHPStan prints **"Result is incomplete because of severe errors"** / "Child process
  error … Fatal error … contains 1 abstract method" / "must be compatible with", those
  are classes PHP cannot even load — **fix those first, then re-run** to get the full list.
- Verify each fix against the core changelog under
  `vendor/typo3/cms-core/Documentation/Changelog/<version>/` (the `Changelog-14-combined.rst`
  is only an index — read the individual `Breaking-*`/`Deprecation-*`/`Feature-*` files).

Breaking changes Rector/Fractor commonly leave for PHPStan to catch:
- **`renderStatic()` ViewHelpers without the `CompileWithRenderStatic` trait** — Fluid 4
  removed `renderStatic()` and the trait; Rector's `MigrateViewHelperRenderStaticRector`
  only converts trait-based ones. Convert the rest by hand to instance `render()`
  (`$arguments` → `$this->arguments`, `$renderChildrenClosure()` → `$this->renderChildren()`,
  `$renderingContext` → `$this->renderingContext`).
- **Removed classes**, e.g. `TYPO3\CMS\Fluid\View\StandaloneView` → render via
  `ViewFactoryInterface`/`ViewFactoryData` (get the `FluidViewAdapter` and use
  `getRenderingContext()->getTemplatePaths()->setTemplateSource(...)`).
- **`render()` signature incompatibilities** — subclasses of
  `AbstractTagBasedViewHelper` / core ViewHelpers whose `render(): string` now needs a
  return type on the override.

**Optional (soft) dependencies.** When PHPStan reports `class.notFound` for a class from
another extension that the code only touches behind a guard (`instanceof`,
`class_exists()`, `interface_exists()`) — so it is safe at runtime whether or not that
extension is installed — do **not** turn it into a hard `require`. Model it as a soft
dependency instead:
- Add it to `composer.json` `suggest` (package name → short description) and to
  `ext_emconf.php` `constraints.suggests` (extension key → version range).
- Silence the analyzer with a **scoped** `ignoreErrors` entry in `phpstan.neon` — narrow
  it by `path` (the file using the class) and a `message` matching the specific class, so
  unrelated errors stay visible. Add a comment explaining why it is optional.

Only make it a hard `require` if the extension genuinely cannot run without it.

### 7. Activate, apply the database schema, and smoke-test

Static analysis is not enough — boot TYPO3 with the extension active and make sure its
database schema exists.

- The extension must be installed/active. For a path-repo package that is not yet
  required, activate it (it stays symlinked in `packages/`):
  `composer require <vendor>/<extension>:@dev`.
- Apply setup and the **database schema**: `ddev typo3 extension:setup`. This creates the
  extension's tables and columns from `ext_tables.sql` and TCA (new tables, plus added
  `pages`/`tt_content` fields). Without it the code loads but tables/fields are missing.
- Run `ddev typo3 cache:flush` and `ddev typo3 cache:warmup` — **both must exit 0**.
  Warmup rebuilds TCA/DI/`ext_localconf` and surfaces bootstrap fatals.
- Verify: `ddev typo3 extension:list` shows the extension active, and
  `ddev typo3 extension:setup --dry-run` reports no pending schema changes (confirm the
  `tx_<ext>_*` tables and new columns actually exist).
- Commit the fixes on `v<target>-dev`.

## Quick Reference

| File | Field | Before (`<prev>`) | After (`<target>`) |
|------|-------|-------------------|--------------------|
| composer.json | `require.typo3/cms-core` | `^<prev>.x` | `^<target>.x` |
| composer.json | `require.php` | old range | version target requires |
| composer.json | `require` dependency | `<prev>`-line | target-compatible line (verify!) |
| composer.json | `license` | `closed` | `proprietary` |
| ext_emconf.php | `version` | `<prev>.x.x` | `<target>.0.0` |
| ext_emconf.php | `depends.typo3` | `<prev>.0.0-<prev>.99.99` | `<target>.0.0-<target>.99.99` |
| ext_emconf.php | obsolete keys | present | removed |

## Common Mistakes

- **Guessing the core constraint** instead of matching the project's root `composer.json`.
- **Carrying over old dependency ranges** without checking target compatibility.
- **Leaving `composer.json` and `ext_emconf.php` out of sync** (e.g. bumping one file only).
- **Using `"closed"`** as a license — not a valid Composer identifier; use `"proprietary"`.
- **Migrating on the wrong branch** instead of a dedicated `v<target>-dev`.
- **Applying Rector/Fractor without a `--dry-run` review** — always inspect the diff, then
  re-run dry-run to confirm idempotency.
- **Assuming one Rector pass is enough** — re-run until `--dry-run` is clean.
- **Not cleaning up after Rector** — it can leave orphaned variables/imports when it
  removes a call (dead-code removal is not in the v14/PHP sets).
- **Expecting Rector to migrate TypoScript/FlexForm/XLIFF** — it only handles PHP; use
  Fractor for non-PHP files.
- **Committing Fractor's output unchecked** — it reformats whole files; verify no
  translation/config content was lost.
- **Skipping PHPStan after the automated tools** — it is what catches trait-less
  `renderStatic`, removed classes, and signature incompatibilities Rector/Fractor miss.
- **Trusting a green Rector/Fractor run as "done"** — the extension may still fatal on
  load. Only PHPStan (static) plus `cache:warmup` with the extension active (functional)
  prove it.
- **Forgetting `extension:setup`** — activating the extension and flushing caches does not
  create its tables/fields. Run `extension:setup` to apply the database schema, then
  confirm with `extension:setup --dry-run`.
- **Turning an optional integration into a hard `require`** just to satisfy PHPStan —
  guarded usage of another extension's class is a soft dependency (`suggest` / `suggests`
  plus a scoped `ignoreErrors`), not a required one.
