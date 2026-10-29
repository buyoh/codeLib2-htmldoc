const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 公開ルートは src/config.json を唯一の情報源とする
const { rootDirectory } = require('./src/config.json');
const tsconfig_json = process.env.TS_NODE_PROJECT || 'tsconfig.json';
console.log('tsconfig', tsconfig_json);

module.exports = {
  // mode: 'development',
  entry: './src/App.tsx',
  output: {
    path: __dirname + '/public/',
    publicPath: rootDirectory + '/',
    filename: 'bundle.[contenthash].js',
    // 古いバンドルを残さない。public/data は生成物ではないため残す
    clean: { keep: /^data\// },
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],
  devServer: {
    static: {
      directory: __dirname + '/public',
      publicPath: rootDirectory,
    },
    port: 8020,
    historyApiFallback: {
      rewrites: [
        { from: /./, to: rootDirectory + '/index.html' }
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