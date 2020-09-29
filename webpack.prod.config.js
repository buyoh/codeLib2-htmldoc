// note: because Object.assign is shallow copy
const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: __dirname + '/public/',
    publicPath: '/codeLib2',
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: __dirname + '/public',
    port: 8020,
    historyApiFallback: {
      rewrites: [
        { from: /./, to: '/index.html' }
      ]
    }
  }
})