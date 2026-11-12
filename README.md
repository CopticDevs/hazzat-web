# Hazzat web

React 18 and React Router 7 application, built with Vite. Use Node 24 (the Azure pipeline version), or Node ^20.19.0 / >=22.12.0, and install with `npm ci --strict-peer-deps`.

See [reader and language analytics](docs/reader-analytics.md) for view definitions, language settings events, reports, and GA verification.
See [booklet generation analytics](docs/booklet-analytics.md) for the success event and test-property verification steps.
See [shared content v4](docs/shared-content-v4.md) for schema compatibility, local feed configuration, format views, and rollout validation.
See [Azure release migration](docs/azure-release-migration.md) and the [manual dev release runbook](docs/azure-dev-release.md) for the deployment and artifact contracts.

## Development and validation

- `npm start`: development server at http://localhost:3000 with React Fast Refresh. `HOST` and `PORT` can override the binding.
- `npm test`: run Jest; add `-- --watch` for interactive watch mode.
- `npm run test-unit -- --runInBand --coverage --coverageReporters=cobertura --coverageReporters=lcov --coverageReporters=text`: Azure-compatible tests, `junit.xml`, and coverage outputs.
- `npm run test-tooling`: build and lint configuration contract tests, including checks that ESLint rejects errors and warnings.
- `npm run typecheck` and `npm run lint`: explicit compiler and lint checks. Lint covers all TypeScript/TSX source files and fails on any error or warning. All Azure PR/build pipelines run the same `npm run lint` command before building. The development server transpiles without running these checks.
- `npm run build`: typecheck and produce the production artifact in `build/`, with hashed assets under `build/static/` as required by the release guards.
- `npm run preview`: serve the built artifact locally. Hosting must retain the existing SPA fallback to `index.html` for direct reader URLs.

## Build configuration

The entry template is `index.html`; `public/` files are copied unchanged. `PUBLIC_URL` sets the asset base and replaces `%PUBLIC_URL%` in the template. The production JavaScript target derives from the existing `browserslist` configuration, and PostCSS retains the existing prefixing/normalization behavior.

Only the five public content configuration variables listed in `.env.example` and `config/build-contract.mjs` are embedded. Azure's existing `REACT_APP_HAZZAT_CONTENT_BASE_URL` injection is unchanged. Arbitrary environment variables, including unlisted `REACT_APP_*` and `VITE_*` variables, are not exposed. These public settings must never contain secrets.

SVG named `ReactComponent` imports are compiled with SVGR without its optional SVGO optimizer. Default SVG imports remain asset URLs for PDF artwork. Fonts, images, and binary booklet artwork are emitted as files.

Jest configuration and asset/CSS mocks live in `jest.config.cjs` and `config/jest/`; they do not depend on react-scripts. Optional content-dataset tests remain opt-in through their existing environment variables.
