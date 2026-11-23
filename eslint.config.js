import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['vendor/', 'public/', 'var/', 'temp/', 'packages/*/Resources/Public/', 'packages/*/Resources/Private/Assets/Js/vendors/bootstrap/', 'packages/*/Resources/Private/Assets/Js/vendors/phone.js'],
  },
  js.configs.recommended,
  {
    files: ['packages/*/Resources/Private/Assets/Js/**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // KIST-JS (Stand v12): globale Objekte aus site-inline.js und den Vendor-Entrypoints,
    // Abbau in der Optimierungsrunde (docs/plans/kist-v14-optimizations.md, O6)
    files: ['packages/ps14_site/Resources/Private/Assets/Js/**/*.js'],
    languageOptions: {
      globals: {
        xna: 'writable',
        tns: 'readonly',
        MicroModal: 'readonly',
        Chart: 'readonly',
        Tobii: 'readonly',
        filter: 'readonly',
      },
    },
  },
  {
    files: ['*.js', 'build/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
