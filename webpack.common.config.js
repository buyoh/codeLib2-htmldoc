const process = require('process');
const tsconfig_json = process.env.TS_NODE_PROJECT || 'tsconfig.json';
console.log('tsconfig', tsconfig_json);

module.exports = {
  // mode: 'development',
  entry: './src/App.tsx',
  output: {
    path: __dirname + '/public/',
    publicPath: '/codeLib2',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: __dirname + '/public',
    contentBasePublicPath: '/codeLib2',
    port: 8020,
    historyApiFallback: {
      rewrites: [
        { from: /./, to: '/codeLib2/index.html' }
      ]
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: tsconfig_json,
          },
        }
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-modules-typescript-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss']
  }
}