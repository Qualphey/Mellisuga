const path = require('path');
const webpack = require('webpack');

module.exports = {
    watch: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    mode: 'development',
    entry: {
      'main': ["babel-polyfill", path.resolve(__dirname, 'src/index.js')]
    },
    output: {
      filename: '[name].js',
      chunkFilename: "[name].chunk.js",
      path: __dirname
    },
    resolve: {
      alias: {
        globals: path.resolve(__dirname, '../../../../../globals/modules')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.css/,
          loader: path.resolve(__dirname, '../../../pages/css-loader.js')
        },
        {
          test: /\.less$/,
          use: [{
            loader: path.resolve(__dirname, '../../../pages/css-loader.js')
          }, {
            loader: 'less-loader'
          }]
        },
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader',
            options: {
              attrs: [':data-src']
            }
          }
        }
      ]
    },
    stats: {
      colors: true
    },
    devtool: 'source-map'
};
