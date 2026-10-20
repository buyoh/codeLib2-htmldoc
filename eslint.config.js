const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const reactHooks = require('eslint-plugin-react-hooks');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: ['public/**', '**/*.scss.d.ts', 'webpack*.js', 'eslint.config.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  prettier,
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
