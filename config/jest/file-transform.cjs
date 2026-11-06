const path = require('node:path');
module.exports = {
  process(_source, filename) {
    const name = JSON.stringify(path.basename(filename));
    return { code: filename.endsWith('.svg')
      ? `const React = require('react'); module.exports = { __esModule: true, default: ${name}, ReactComponent: React.forwardRef(function SvgAsset(props, ref) { return React.createElement('svg', {...props, ref}, ${name}); }) };`
      : `module.exports = ${name};` };
  },
};
