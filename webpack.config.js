var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
      './dist/test': './test/index.js',
      './dist/main': './src/index.js'
    },
    output: {
      filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
              test: /\.json$/,
              loader: 'json-loader'
            }
        ],
        rules: [
          {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
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
          },
          {
            test: /\.vs$/,
            use: 'raw-loader'
          },
          {
            test: /\.fs$/,
            use: 'raw-loader'
          }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};
