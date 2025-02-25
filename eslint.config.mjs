import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import nodePlugin from 'eslint-plugin-n';

export default [
  {
    ignores: ['**/node_modules/*', '**/.history/*', '**/.husky/*', '**/dist/*'],
  },
  nodePlugin.configs['flat/recommended-script'],
  eslintPluginPrettierRecommended,
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    files: ['**/*.{js,mjs,cjs,ts}'],
    rules: {
      'max-len': ['error', { code: 120 }],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'n/no-missing-import': 'off',
      'n/no-unpublished-import': [
        'error',
        {
          allowModules: ['eslint-plugin-prettier', 'eslint-plugin-n', 'dotenv', 'typescript-eslint', '@eslint/js'],
        },
      ],
      'n/no-extraneous-import': [
        'error',
        {
          allowModules: ['globals'],
        },
      ],
    },
  },
];
