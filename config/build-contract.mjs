// Public build-time configuration is deliberately enumerated, never process.env wholesale.
export const publicKeys = [
  'REACT_APP_HAZZAT_DEV_CONTENT_BASE_URL',
  'REACT_APP_HAZZAT_PPE_CONTENT_BASE_URL',
  'REACT_APP_HAZZAT_PROD_CONTENT_BASE_URL',
  'REACT_APP_HAZZAT_CONTENT_BASE_URL',
  'REACT_APP_HAZZAT_CONTENT_ETAGS',
];
export function publicDefinitions(env) {
  return Object.fromEntries(publicKeys.map(key => [
    `process.env.${key}`, env[key] === undefined ? 'undefined' : JSON.stringify(env[key]),
  ]));
}
export function publicBase(value = '/') {
  return value.endsWith('/') ? value : `${value}/`;
}
export function svgComponentImports(source) {
  return source.replace(
    /(\bimport\s*\{[^}]*\bReactComponent\b[^}]*\}\s*from\s*["'])([^"']+\.svg)(["'])/g,
    '$1$2?react$3',
  );
}
