import js from '@eslint/js';
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'dev-dist/**', 'node_modules/**', 'public/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...eslintPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      'no-unsafe-finally': 'off',
    },
    settings: {
      react: {
        version: '18.3',
      },
    },
  },
];
