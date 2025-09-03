require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: [
    '.next',
    'dist',
    'out',
    'coverage',
    '.turbo',
    'public/**/*.js',
    'node_modules',
  ],
  plugins: [
    '@typescript-eslint',
    'simple-import-sort',
    'i18next', // 👈 adicionamos aqui
  ],
  rules: {
    // ordenar imports
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // "unused" só alerta; ignora nomes iniciados com "_"
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],

    // permite curtos-circuitos/ternários como expressões
    '@typescript-eslint/no-unused-expressions': [
      'warn',
      { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
    ],

    // limite de largura de linha
    'max-len': [
      'error',
      {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: false,
      },
    ],

    'i18next/no-literal-string': [
      'warn',
      {
        markupOnly: true,
        ignoreAttribute: [
          'id',
          'key',
          'to',
          'href',
          'className',
          'data-testid',
          'aria-label',
          'aria-describedby',
        ],
      },
    ],
  },
};
