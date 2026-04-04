import js from '@eslint/js';
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'uploads/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
    },
    rules: {
      ...eslintPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off',
    },
  },
];
