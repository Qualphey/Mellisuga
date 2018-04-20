const path = require('path');
const webpack = require('webpack');


console.log(path.resolve(__dirname, '../../../node_modules'));
module.exports = {
    watch: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    mode: 'development',
    entry: {
      'main': './src/index.js'
    },
    output: {
      filename: '[name].js',
      chunkFilename: "[name].chunk.js",
      path: path.resolve(__dirname, "dist")
    },
    resolve: {
      modules: [
        path.resolve(__dirname, '../../../node_modules')
      ]
    },
    module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
              presets: ['es2017']
            }
          },
          {
            test: /\.json$/,
            loader: 'json-loader'
          },
          {
            test: /\.css$/,
            use: [ 'style-loader', {
              loader: 'css-loader',
              options: {
                url: false
              }
            }]
          },
          {
            test: /\.less$/,
            use: [{
              loader: "style-loader"
            }, {
              loader: "css-loader"
            }, {
              loader: "less-loader" // compiles Less to CSS
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
