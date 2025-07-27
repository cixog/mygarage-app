import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base configurations for globals
  {
    languageOptions: {
      ecmaVersion: 'latest', // Use the latest ECMAScript features
      sourceType: 'module', // Support ES Modules
      globals: { ...globals.browser, ...globals.node }, // Add browser and Node.js globals
    },
  },
  // Recommended base rules from ESLint
  pluginJs.configs.recommended,

  // Custom rules and overrides
  {
    rules: {
      // Example: Turn off the "no-console" rule if console logs are acceptable
      'no-console': 'off',
      // Example: Warn for missing return values in arrow functions
      'consistent-return': 'off',
      // Example: Use object spread syntax instead of Object.assign
      'prefer-object-spread': 'warn',
      // Allow unused variables if they are function parameters (e.g., req, res, next)
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
];
