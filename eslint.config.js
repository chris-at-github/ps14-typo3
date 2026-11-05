import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['vendor/', 'public/', 'var/', 'packages/*/Resources/Public/'],
  },
  js.configs.recommended,
  {
    files: ['packages/*/Resources/Private/Assets/Js/**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['*.js', 'build/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
