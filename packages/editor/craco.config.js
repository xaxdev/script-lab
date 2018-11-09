const path = require('path')

// const { paths } = require('@craco/craco')

module.exports = {
  // webpack: {
  //     alias: {
  //         "@components": path.resolve(__dirname, `${paths.appSrc}/components/`)
  //     }
  // },
  jest: {
    configure: {
      moduleNameMapper: {
        'office-ui-fabric-react/lib/': 'office-ui-fabric-react/lib-commonjs/',
      },
      transform: {
        '^.+\\.jsx?$': '<rootDir>/testing/transform.js',
      },
    },
  },
}
