const babelOptions = {
  presets: ['@babel/preset-react', '@babel/preset-env'],
  plugins: [
    'require-context-hook',
    'react-hot-loader/babel',
    '@babel/plugin-proposal-class-properties',
  ],
}

module.exports = require('babel-jest').createTransformer(babelOptions)
