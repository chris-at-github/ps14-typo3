export default {
  "extends": ["stylelint-config-standard-scss"],
  "plugins": ["stylelint-scss"],
  "rules": {
    "block-no-empty": true,
    "no-descending-specificity": null,
    "font-family-no-missing-generic-family-keyword": [true, {"ignoreFontFamilies": ["iconfont"]}],
    "selector-class-pattern": ["^[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$"],
    "scss/percent-placeholder-pattern": ["^[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$"]
  }
}
