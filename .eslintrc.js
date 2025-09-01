module.exports = {
  root: true,
  plugins: ['prettier'],
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
  },
  ignorePatterns: ['dist/', 'build/', '.next/', 'node_modules/', '*.js'],

};
