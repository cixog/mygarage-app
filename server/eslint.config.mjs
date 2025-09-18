import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base configurations for globals
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
  },
  // Recommended base rules from ESLint
  pluginJs.configs.recommended,

  // Custom rules and overrides
  {
    rules: {
      'no-console': 'off',
      'consistent-return': 'off',
      'prefer-object-spread': 'warn',
      // OVERRIDE the recommended 'no-unused-vars' to ignore catch clause variables
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    },
  },
];
