export default {
  "extends": ["stylelint-config-standard-scss"],
  "plugins": ["stylelint-scss"],
  "rules": {
    "block-no-empty": true,
    "no-descending-specificity": null,
    "font-family-no-missing-generic-family-keyword": [true, {"ignoreFontFamilies": ["iconfont"]}],
    "selector-class-pattern": ["^[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$"],
    "scss/percent-placeholder-pattern": ["^[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$"]
  },
  "overrides": [
    {
      // KIST-SCSS (Stand v12): Namenskonventionen des Altprojekts, Abbau in der Optimierungsrunde
      // (docs/plans/kist-v14-optimizations.md, O1/O3)
      "files": ["packages/ps14_site/Resources/Private/Assets/Scss/**/*.scss"],
      "rules": {
        "no-duplicate-selectors": null,
        "custom-property-pattern": null,
        "selector-class-pattern": null,
        "selector-id-pattern": null,
        "scss/at-mixin-pattern": null,
        "scss/percent-placeholder-pattern": null,
        "scss/no-global-function-names": null
      }
    }
  ]
}
