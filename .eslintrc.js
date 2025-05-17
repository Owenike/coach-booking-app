/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended' // 👈 加這行才會生效
  ],
  plugins: ['@typescript-eslint'], // 👈 告訴 ESLint 要用這個 plugin
  parser: '@typescript-eslint/parser', // 👈 使用 TypeScript 專用解析器
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@next/next/no-img-element': 'off'
  }
};
