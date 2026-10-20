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
    static: {
      directory: __dirname + '/public',
      publicPath: '/codeLib2',
    },
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
          {
            loader: 'css-loader',
            options: {
              // *.module.scss のみ CSS Modules。default import 形式を維持する
              modules: {
                auto: true,
                namedExport: false,
                exportLocalsConvention: 'as-is',
              },
            },
          },
          {
            loader: 'sass-loader',
            options: { api: 'modern-compiler' },
          },
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