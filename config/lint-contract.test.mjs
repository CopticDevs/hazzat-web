import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('the shared lint command covers TypeScript source and rejects all warnings', () => {
  assert.equal(pkg.scripts.lint, 'eslint src --ext .ts,.tsx --max-warnings 0');
});

for (const pipeline of ['dev', 'ppe.gated', 'ppe', 'prod']) {
  test(`${pipeline} runs the shared lint gate before building`, () => {
    const yaml = readFileSync(new URL(`../.pipelines/azure-pipelines.${pipeline}.yml`, import.meta.url), 'utf8');
    const steps = yaml.split(/(?=^- task: )/m);
    const lintIndex = steps.findIndex(step => /customCommand: 'run lint'/.test(step));
    const buildIndex = steps.findIndex(step => /customCommand: 'run build'/.test(step));
    assert(lintIndex >= 0 && buildIndex > lintIndex, 'lint must run before the build');
    assert.match(steps[lintIndex], /^- task: Npm@1\n/);
    assert.doesNotMatch(steps[lintIndex], /continueOnError:|condition:/, 'lint must not be optional');
  });
}

// Feed snippets through the real source configuration without writing broken source
// to disk or scanning source files that another test/worker might be changing.
function lintSnippet(source) {
  const [command, ...args] = pkg.scripts.lint.split(' ');
  assert.equal(command, 'eslint');
  const sourceIndex = args.indexOf('src');
  assert.notEqual(sourceIndex, -1);
  args.splice(sourceIndex, 1, '--stdin', '--stdin-filename', 'src/lint-contract.tsx');
  const result = spawnSync(process.execPath, ['node_modules/eslint/bin/eslint.js', ...args, '--format', 'json'], {
    cwd: root, input: source, encoding: 'utf8', timeout: 30000,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return { ...result, reports: JSON.parse(result.stdout) };
}

test('the lint command accepts clean source', () => {
  const result = lintSnippet('export const answer = 42;\n');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.reports[0].errorCount, 0);
  assert.equal(result.reports[0].warningCount, 0);
});

test('the lint command fails for an ESLint error', () => {
  const result = lintSnippet(`import { useState } from 'react';
export function invalidHook() { return useState(0); }
`);
  assert.equal(result.status, 1, result.stderr);
  assert(result.reports[0].messages.some(message => message.ruleId === 'react-hooks/rules-of-hooks' && message.severity === 2));
});

test('the lint command fails for a warning with no errors', () => {
  const result = lintSnippet('const unused = 42;\nexport {};\n');
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.reports[0].errorCount, 0);
  assert(result.reports[0].warningCount > 0);
  assert(result.reports[0].messages.some(message => message.ruleId === '@typescript-eslint/no-unused-vars' && message.severity === 1));
});
