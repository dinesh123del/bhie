import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

test('client core files exist', () => {
  const files = [
    'src/App.tsx',
    'src/main.tsx',
    'src/pages/Dashboard.tsx',
    'src/pages/Analytics.tsx',
  ];

  for (const file of files) {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} should exist`);
  }
});

test('client package exposes required scripts', async () => {
  const packageJson = JSON.parse(await fs.promises.readFile(path.join(root, 'package.json'), 'utf8'));

  assert.equal(typeof packageJson.scripts.build, 'string');
  assert.equal(typeof packageJson.scripts.lint, 'string');
  assert.equal(typeof packageJson.scripts.typecheck, 'string');
  assert.equal(typeof packageJson.scripts.test, 'string');
});
