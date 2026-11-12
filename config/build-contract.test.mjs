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

test('actual Vite SVG output supports dynamic titles, SVG refs and separate asset URLs', async t => {
  const previousNodeEnv = process.env.NODE_ENV;
  t.after(() => {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousNodeEnv;
  });
  const { build } = await import('vite');
  const { createRequire } = await import('node:module');
  const { readFileSync } = await import('node:fs');
  const path = await import('node:path');
  const require = createRequire(import.meta.url);
  const entry = '\0hazzat-svg-contract.tsx';
  const svgPath = path.resolve('src/images/logo.svg').replaceAll('\\', '/');
  const result = await build({
    logLevel: 'silent',
    plugins: [{
      name: 'svg-contract-entry',
      resolveId: id => id === entry ? entry : undefined,
      load: id => id === entry
        ? `import { ReactComponent as Icon } from ${JSON.stringify(svgPath)};\nimport url from ${JSON.stringify(svgPath)};\nexport { Icon, url };`
        : undefined,
    }],
    build: {
      write: false, minify: false, sourcemap: false,
      rolldownOptions: {
        input: entry, preserveEntrySignatures: 'strict',
        external: ['react', 'react/jsx-runtime'],
        output: { format: 'cjs' },
      },
    },
  });
  const output = (Array.isArray(result) ? result[0] : result).output;
  const chunk = output.find(item => item.type === 'chunk' && item.isEntry);
  assert(chunk, 'Vite emitted the actual SVG import entry');
  const module = { exports: {} };
  new Function('require', 'module', 'exports', chunk.code)(require, module, module.exports);
  const { Icon, url } = module.exports;
  assert.equal(typeof url, 'string');
  const asset = output.find(item => item.type === 'asset' && `/${item.fileName}` === url);
  assert(asset, 'default import remains an emitted asset URL');
  assert.deepEqual(Buffer.from(asset.source), readFileSync(svgPath), 'URL artwork is unchanged');

  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!doctype html><div id="root"></div>');
  const globals = { window: dom.window, document: dom.window.document, navigator: dom.window.navigator };
  const previous = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  let root;
  try {
    const React = require('react');
    const { createRoot } = require('react-dom/client');
    const { flushSync } = require('react-dom');
    const ref = React.createRef();
    root = createRoot(document.getElementById('root'));
    flushSync(() => root.render(React.createElement(Icon, { ref, title: 'First title', titleId: 'logo-title', className: 'contract-icon', width: 123, 'data-contract': 'svg' })));
    assert(ref.current instanceof dom.window.SVGElement, 'ref reaches the root SVG');
    const svg = ref.current;
    const title = svg.querySelector('title');
    assert(title, 'dynamic title creates a title child rather than an SVG attribute');
    assert.equal(title.textContent, 'First title');
    assert.equal(title.id, 'logo-title');
    assert.equal(svg.getAttribute('aria-labelledby'), 'logo-title');
    assert.equal(svg.getAttribute('class'), 'contract-icon');
    assert.equal(svg.getAttribute('width'), '123');
    assert.equal(svg.getAttribute('data-contract'), 'svg');
    flushSync(() => root.render(React.createElement(Icon, { ref, title: 'Changed title', titleId: 'logo-title' })));
    assert.equal(ref.current, svg);
    assert.equal(svg.querySelectorAll('title').length, 1);
    assert.equal(svg.querySelector('title').textContent, 'Changed title');
    flushSync(() => root.unmount());
    root = undefined;
    assert.equal(ref.current, null);
  } finally {
    if (root) require('react-dom').flushSync(() => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});

test('SVG declarations accept SVG refs and title IDs, and reject an HTML element ref', async () => {
  const { default: ts } = await import('typescript');
  const path = await import('node:path');
  const file = path.resolve('config/svg-contract.types.tsx');
  const source = `import * as React from 'react';
import { ReactComponent as Icon } from '../src/images/logo.svg';
const svg = <Icon ref={React.createRef<SVGSVGElement>()} title="Logo" titleId="logo-title" className="logo" />;
// @ts-expect-error SVG components cannot forward an HTML div ref.
const invalid = <Icon ref={React.createRef<HTMLDivElement>()} />;
`;
  const options = { noEmit: true, strict: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX, moduleResolution: ts.ModuleResolutionKind.NodeJs, target: ts.ScriptTarget.ES2020 };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (name, languageVersion, ...rest) => name === file
    ? ts.createSourceFile(name, source, languageVersion, true, ts.ScriptKind.TSX)
    : getSourceFile(name, languageVersion, ...rest);
  const program = ts.createProgram([file, path.resolve('src/react-app-env.d.ts')], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.deepEqual(diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
});

// Safari reads the initial document, rather than a React-inserted tag.
test('initial HTML advertises the verified iOS app without unverified deep links', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const tags = html.match(/<meta\s+name="apple-itunes-app"[^>]*>/g);
  assert.equal(tags?.length, 1);
  assert.match(tags[0], /content="app-id=6753879416"/);
});
