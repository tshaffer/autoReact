var FlowBabelWebpackPlugin = require('flow-babel-webpack-plugin');

var webpack = require('webpack');
var environment = require ('./environment');

module.exports = {

  entry: './src/index.js',
  output: {
    publicPath: './build/',
    path: './build',
    filename: 'bundle.js'
  },
  devtool: "source-map",
  watchOptions: {
    poll: true
  },
  target: 'electron',
  module: {
    preLoaders: [
      {
        test: /\.jsx$|\.js$/,
        loader: 'eslint-loader',
        include: __dirname + '/src',
        exclude: /build\.js$/
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
            presets: ['react', 'es2015', 'stage-0']
        }
      },
      {
        test: /\.json?$/,
        loader: 'json'
      },
    ]
  },
  plugins: [
    new FlowBabelWebpackPlugin(),
    new webpack.DefinePlugin(environment.globals)
  ],
}