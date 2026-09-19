const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');

const { ESLint } = require('eslint');

const config = require('../index.cjs');

// The rules eslint applies to a component file under the config as shipped.
const rulesFor = async (filename) => {
  const eslint = new ESLint({
    cwd: path.join(__dirname, '..'),
    overrideConfigFile: true,
    overrideConfig: config,
  });

  const resolved = await eslint.calculateConfigForFile(filename);

  return resolved.rules;
};

const ERROR = 2;
const WARN = 1;

test('breaking a rule of hooks fails the lint', async () => {
  const rules = await rulesFor('probe.tsx');

  assert.equal(rules['react-hooks/rules-of-hooks'][0], ERROR);
});

test('the React Compiler checks warn and block nothing', async () => {
  const rules = await rulesFor('probe.tsx');

  const compilerChecks = Object.keys(rules).filter(
    (rule) =>
      rule.startsWith('react-hooks/') &&
      rule !== 'react-hooks/rules-of-hooks' &&
      rule !== 'react-hooks/exhaustive-deps',
  );

  assert.ok(compilerChecks.includes('react-hooks/set-state-in-effect'));

  for (const rule of compilerChecks) {
    assert.ok(rules[rule][0] <= WARN, `${rule} is an error`);
  }
});
