module.exports = {
  module: {
    rules: [{ test: /\.(ts|tsx)$/, loader: require.resolve('ts-loader') }],
  },
  // const config = genDefaultConfig(baseConfig, env)
  // // Extend it as you need.
  // // For example, add typescript loader:
  // config.module.rules.push({
  //   test: /\.(ts|tsx)$/,
  //   loader: require.resolve('ts-loader'),
  // })

  // config.resolve.extensions.push('.ts', '.tsx')
  // return config
}
