import test from 'node:test';
import assert from 'node:assert/strict';
import { publicBase, publicDefinitions, svgComponentImports } from './build-contract.mjs';

test('only the approved public variables are embedded, including safely quoted values', () => {
  const defs = publicDefinitions({ SECRET_TOKEN: 'private', VITE_SECRET: 'private', REACT_APP_UNLISTED: 'private', REACT_APP_HAZZAT_CONTENT_BASE_URL: 'https://example.test/"quoted"' });
  assert.equal(JSON.parse(defs['process.env.REACT_APP_HAZZAT_CONTENT_BASE_URL']), 'https://example.test/"quoted"');
  assert.equal(defs['process.env.REACT_APP_HAZZAT_CONTENT_ETAGS'], 'undefined');
  assert.equal(JSON.stringify(defs).includes('private'), false);
});
test('PUBLIC_URL supports root, subdirectory, relative and CDN asset bases', () => {
  for (const [value, expected] of [[undefined, '/'], ['/hazzat', '/hazzat/'], ['.', './'], ['https://cdn.test/site/', 'https://cdn.test/site/']]) assert.equal(publicBase(value), expected);
});
test('named SVG components are transformed without changing default PDF artwork URLs', () => {
  const source = `import { ReactComponent as Logo } from './logo.svg';\nimport logo from './logo.svg';`;
  assert.equal(svgComponentImports(source), `import { ReactComponent as Logo } from './logo.svg?react';\nimport logo from './logo.svg';`);
});
