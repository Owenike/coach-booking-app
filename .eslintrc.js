/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: 'next',
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@next/next/no-img-element': 'off',
  },
};
