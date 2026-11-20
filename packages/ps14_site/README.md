# ps14_site

Sitepackage-Extension für das konkrete Projekt. Sie überschreibt Templates und Konfiguration der Basis-Extension `ps14_foundation` und enthält das projektspezifische CSS und JS.

## Inhalt

- **Configuration/**: projektspezifisches TypoScript, TCA-Overrides, TSconfig, RTE-Presets, Vite-Entrypoints
- **Resources/Private/**: überschriebene Templates, Layouts und Partials (Fluid), Komponenten, Sprachdateien
- **Resources/Private/Assets/**: SCSS und JS, gebaut mit Vite (`ddev vite`)
- **Resources/Public/**: Icons, SVGs, Iconfont

## Einsatz

Wird im Hauptprojekt `ps14-typo3` unter `packages/` per Composer eingebunden (`ps14/ps14_site`). Änderungen am Grundaufbau gehören nicht hierher, sondern in `ps14_foundation`.
