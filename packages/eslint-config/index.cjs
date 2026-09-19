const js = require('@eslint/js');
const globals = require('globals');
const next = require('eslint-config-next');
const turbo = require('eslint-config-turbo/flat');
const unusedImports = require('eslint-plugin-unused-imports');
const tseslint = require('typescript-eslint');

const transaction = require('./transaction.cjs');

const source = ['**/*.ts', '**/*.tsx'];

// eslint-config-next 16 enables react-hooks 7's recommended set, which adds the
// React Compiler's checks to the two rules of hooks the set held before. This
// code was written before the compiler and not to its model, so its checks
// report as warnings: every run still lists them, and none blocks a commit.
const reactCompilerRules = [
  'react-hooks/static-components',
  'react-hooks/use-memo',
  'react-hooks/preserve-manual-memoization',
  'react-hooks/immutability',
  'react-hooks/globals',
  'react-hooks/refs',
  'react-hooks/set-state-in-effect',
  'react-hooks/error-boundaries',
  'react-hooks/purity',
  'react-hooks/set-state-in-render',
  'react-hooks/config',
  'react-hooks/gating',
];

// The shared lint config, as ESLint 10 reads one: an array, in order, later
// entries winning. Everything the eslintrc form said is here — it changed
// spelling, not meaning.
module.exports = [
  ...transaction,
  ...next,
  {
    name: 'esign/react-compiler',
    rules: Object.fromEntries(reactCompilerRules.map((rule) => [rule, 'warn'])),
  },
  ...(turbo.default ?? turbo),
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    name: 'esign/source',
    files: source,

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['../../tsconfig.eslint.json'],
        ecmaVersion: 2022,
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
      globals: { ...globals.es2022, ...globals.node, ...globals.browser },
    },

    plugins: { 'unused-imports': unusedImports },

    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'react/no-unescaped-entities': 'off',

      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],

      'no-multi-spaces': [
        'error',
        {
          ignoreEOLComments: false,
          exceptions: {
            BinaryExpression: false,
            VariableDeclarator: false,
            ImportDeclaration: false,
            Property: false,
          },
        },
      ],

      // Safety with promises so we aren't running with scissors
      'no-promise-executor-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-atomic-updates': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-await': 'error',

      // We never want to use `as` but are required to on occasion to handle
      // shortcomings in third-party and generated types.
      //
      // To handle this we want this rule to catch usages and highlight them as
      // warnings so we can write appropriate interfaces and guards later.
      '@typescript-eslint/consistent-type-assertions': ['warn', { assertionStyle: 'never' }],

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false,
        },
      ],
    },
  },

  {
    // `node:test` awaits the promise a describe/test call returns; a test
    // file states its cases rather than chaining them.
    name: 'esign/tests',
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
];
