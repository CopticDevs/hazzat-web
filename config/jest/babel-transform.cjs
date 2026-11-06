module.exports = require('babel-jest').default.createTransformer({
  presets: [
    [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
    [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
    require.resolve('@babel/preset-typescript'),
  ],
  babelrc: false,
  configFile: false,
});
