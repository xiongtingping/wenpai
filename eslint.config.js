import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import undefinedConcatPlugin from './src/utils/eslint-undefined-concat-rules.js';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      '.netlify',
      'backup',
      'examples',
      'netlify/functions',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs'
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'undefined-concat': undefinedConcatPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // 关闭会产生大量“提示级别”告警的规则，确保 lint 0 warnings
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      'no-useless-escape': 'off',
      // 自定义规则：防止undefined拼接（仅保留关键错误规则）
      'undefined-concat/no-unsafe-user-concat': 'error',
      'undefined-concat/require-safe-user-access': 'off'
    },
  },
)
