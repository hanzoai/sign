const shared = require('@hanzo/esign-eslint-config');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    // What is never linted. These were `.eslintignore` and `ignorePatterns`; a
    // flat config keeps them in the one file that holds everything else.
    ignores: [
      // Config files
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      // Statically hosted javascript files
      'apps/*/public/*.js',
      'apps/*/public/*.cjs',
      'scripts/**',
      '**/lingui.config.ts',
      'packages/lib/translations/**/*.js',
      // Generated
      'packages/prisma/generated/**',
    ],
  },

  ...shared,

  {
    settings: {
      next: { rootDir: ['apps/*/'] },
      // Stated, not detected. eslint-plugin-react finds the version by asking the
      // rule context for a filename through an API ESLint 10 removed, so detection
      // throws on the first file; a declared version never takes that path.
      react: { version: '19.2.8' },
    },
    rules: {
      '@next/next/no-img-element': 'off',
      'no-unreachable': 'error',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];
