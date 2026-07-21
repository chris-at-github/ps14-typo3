# General Rules
- Ask for confirmation before proceeding with further steps that go beyond my explicit instructions.
- Do not execute any scripts (e.g., DDEV, NPM) unless they are explicitly specified in this file.

# Allowed Commands
`php` and `composer` are not available on the host — always run them through DDEV.
The following commands are explicitly allowed (no confirmation needed):

## DDEV
- `ddev describe`
- `ddev typo3 --version`
- `ddev typo3 extension:list`
- `ddev typo3 extension:setup`
- `ddev typo3 cache:*`
- `ddev typo3 upgrade:*`
- `ddev composer show <package>`
- `ddev composer validate`
- `ddev exec vendor/bin/phpstan analyse …`
- `ddev mysql -e "SELECT …"` (read-only queries only)
- `ddev exec vendor/bin/rector process`
- `ddev exec vendor/bin/fractor process`

Any other script (NPM builds, destructive DB operations, deployments, etc.) still
requires confirmation.

# GIT
- Add new, relevant files to the repository via `git add`.
- When changes are to be made, they must be performed in a dedicated branch.
- I will handle `git push` and `git merge` myself.

# Technology Stack & Versions
- TYPO3 Version: 14.x
- PHP Version: 8.4+
- Database: MySQL / MariaDB via Doctrine DBAL
- Frontend: Fluid, SCSS, JavaScript (ESM / Native ES Modules)

# General Coding Guidelines
- Use strict typing in PHP (`declare(strict_types=1);` is mandatory on the first line).
- Follow the PSR-12 (or PER Coding Style) standard.
- Exclusively use PHP Attributes (e.g., `#[Inject]`, `#[Validate]`, `#[Route]`). Doctrine annotations are strictly forbidden.
- Prefer "Constructor Injection" for Dependency Injection. The `#[Inject]` attribute should only be used in exceptional cases.
- Utilize modern PHP 8.4+ features (e.g., Readonly Classes/Properties, Enums, Match expressions).
- Strictly avoid any deprecated functions or classes of the TYPO3 v13 and v14 Core API.
- Provide concise answers. Deliver the complete code block without unnecessary explanations unless explicitly requested.

# TYPO3 Specifics

## Extbase & Fluid
- Keep controllers lean. Business logic belongs in Domain Services or Repositories.
- Use modern Fluid syntax. Enable Strict Mode in Fluid wherever possible.
- Do not use deprecated ViewHelpers. Avoid `<f:format.raw>` to prevent XSS vulnerabilities.
- Consistently use Site Handling configuration (`config.yaml`) for routing.

## TCA (Table Configuration Array)
- Write modern, streamlined TCA for TYPO3 v14.
- Use dedicated TCA types (e.g., `type => 'email'`, `type => 'datetime'`, `type => 'color'`, `type => 'file'`) instead of complex `renderType` workarounds.
- Define palettes logically and use `showitem` clearly to keep the backend organized (e.g., Access, Hidden, Start/Stop).
- Place TCA overrides correctly in `Configuration/TCA/Overrides/`.
- When creating Custom Content Elements: Prefer using the TYPO3 Content Blocks API where applicable.

## TypoScript & TSconfig
- File extensions must be `.typoscript` or `.tsconfig` (never use `.ts` or `.txt`).
- Use the new TypoScript syntax (e.g., `@import` for file inclusions, modern assignment operators).
- Prefer Site Handling and Site Settings over maintaining endless TypoScript constants.
- Exclusively use DataProcessors (e.g., `menuProcessor`, `databaseQueryProcessor`) combined with FLUIDTEMPLATE for rendering content elements.

## Database Operations & Events
- Exclusively use the TYPO3 QueryBuilder (Doctrine DBAL) for database queries outside of Extbase repositories. Never use raw, native SQL.
- Use PSR-14 Event Registration via `Services.yaml` or `#[AsEventListener]` instead of legacy hooks.
- Never access global variables like `$_GET` or `$_POST` directly. Always use the PSR-7 Request object instead (`$request->getParsedBody()`, `$request->getQueryParams()`).

# File and Directory Structure
Ensure strict adherence to the directory structure of a modern TYPO3 extension when generating code:
- `Classes/` (Controller, Domain, EventListener, Service, etc.)
- `Configuration/TCA/` and `Configuration/TCA/Overrides/`
- `Configuration/TypoScript/` and `Configuration/TsConfig/`
- `Configuration/Services.yaml` for Dependency Injection and Event Listeners
- `Resources/Private/Language/` for XLIFF files
- `Resources/Private/Templates/`, `Layouts/`, `Partials/` for Fluid