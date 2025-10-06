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
      'CLEANUP_BACKUP*',
      'UNIFIED_CLEANUP_BACKUP*',
      '.archive',
      '.archive/**',
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
      // 收紧 React Hooks 规则：强制禁止嵌套/条件调用 Hooks
      // 使用官方推荐集合作为基线
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      // 可选：若担心误报，可暂保留 exhaustive-deps 关闭状态，后续逐步治理再升级为 'warn' 或 'error'
      'react-hooks/exhaustive-deps': 'off',

      // 其它项目既有放宽项
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      'no-useless-escape': 'off',

      // 自定义规则：防止 undefined 拼接（仅保留关键错误规则）
      'undefined-concat/no-unsafe-user-concat': 'error',
      'undefined-concat/require-safe-user-access': 'off'
    },
  },
)
