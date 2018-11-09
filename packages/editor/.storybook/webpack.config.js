// module.exports = {
//   module: {
//     rules: [
//       { test: /\.(ts|tsx)$/, loader: require.resolve('awesome-typescript-loader') },
//     ],
//   },
//   // const config = genDefaultConfig(baseConfig, env)
//   // // Extend it as you need.
//   // // For example, add typescript loader:
//   // config.module.rules.push({
//   //   test: /\.(ts|tsx)$/,
//   //   loader: require.resolve('ts-loader'),
//   // })

//   // config.resolve.extensions.push('.ts', '.tsx')
//   // return config
// }d
const path = require('path')
const TSDocgenPlugin = require('react-docgen-typescript-webpack-plugin')
module.exports = (baseConfig, env, defaultConfig) => {
  defaultConfig.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('awesome-typescript-loader'),
  })
  defaultConfig.plugins.push(new TSDocgenPlugin())
  defaultConfig.resolve.extensions.push('.ts', '.tsx')
  return defaultConfig
}
