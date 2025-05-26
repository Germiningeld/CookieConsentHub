const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      'cookie-consent': './src/js/cookie-consent.js',
      'cookie-consent-gtm': './src/js/cookie-consent-gtm.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].min.js' : 'js/[name].js',
      library: {
        name: 'CookieConsent',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  outputStyle: isProduction ? 'compressed' : 'expanded'
                }
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode)
      }),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: isProduction ? 'css/[name].min.css' : 'css/[name].css'
      }),
      new CopyPlugin({
        patterns: [
          {
            from: 'src/css',
            to: 'css',
            noErrorOnMissing: true
          }
        ]
      })
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ]
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: 9000,
      hot: true,
      open: true
    },
    devtool: isProduction ? false : 'source-map'
  };
}; 