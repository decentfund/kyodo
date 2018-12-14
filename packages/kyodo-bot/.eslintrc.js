module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parser: 'babel-eslint',
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'double'],
    semi: ['error', 'always'],
    'no-console': 'warn',
    indent: [2, 2],
  },
};
