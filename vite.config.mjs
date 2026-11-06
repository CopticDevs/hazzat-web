import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { publicBase, publicDefinitions, svgComponentImports } from './config/build-contract.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_', 'PUBLIC_URL', 'PORT', 'HOST']);
  const base = publicBase(env.PUBLIC_URL);
  return {
    base,
    // Disable Vite's automatic VITE_* exposure; the whitelist below is the public API.
    envPrefix: [],
    define: {
      ...publicDefinitions(env),
      'process.env.PUBLIC_URL': JSON.stringify(base.replace(/\/$/, '')),
    },
    plugins: [
      {
        name: 'hazzat-public-html',
        transformIndexHtml: {
          order: 'pre',
          handler: html => html.replaceAll('%PUBLIC_URL%', base.replace(/\/$/, '')),
        },
      },
      {
        name: 'hazzat-svg-components',
        enforce: 'pre',
        transform(source, id) {
          if (!id.includes('/node_modules/') && /\.[jt]sx?(?:\?|$)/.test(id)) {
            const code = svgComponentImports(source);
            if (code !== source) return { code, map: null };
          }
        },
      },
      svgr({ svgrOptions: { exportType: 'named', namedExport: 'ReactComponent', jsxRuntime: 'automatic', titleProp: true, ref: true, plugins: ['@svgr/plugin-jsx'] } }),
      react(),
    ],
    assetsInclude: ['**/*.bin'],
    build: {
      outDir: 'build',
      assetsDir: 'static',
      assetsInlineLimit: 0,
      sourcemap: process.env.GENERATE_SOURCEMAP !== 'false',
      target: browserslistToEsbuild(undefined, { env: 'production' }),
    },
    server: { port: Number(env.PORT || 3000), host: env.HOST || 'localhost' },
  };
});
