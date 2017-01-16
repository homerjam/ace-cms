const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'source-map',

  entry: path.join(__dirname, 'client', 'app', 'app'),

  output: {
    path: path.join(__dirname, 'public', 'build'),
    filename: 'js/bundle.js',
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    // new webpack.ProvidePlugin({
    //   jQuery: 'jquery',
    //   $: 'jquery',
    //   'window.jQuery': 'jquery',
    // }),
    new ExtractTextPlugin('css/bundle.css', {
      disable: false,
      allChunks: true,
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false,
      },
    }),
  ],

  resolve: {
    root: [path.join(__dirname, 'node_modules')],
    fallback: [path.join(__dirname, 'bower_components')],
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules|bower_components/,
        loaders: [
          'ng-annotate',
          'babel',
        ],
      },
      {
        test: /\.html$/,
        loader: 'raw',
      },
      {
        test: /\.jade$/,
        loaders: ['raw', 'jade-html'],
      },
      {
        test: /\.styl$/,
        loaders: ['style', 'css?sourceMap', 'autoprefixer?{browsers:["last 2 versions", "Explorer >= 9"]}', 'stylus?sourceMap'],
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          'style',
          'css?sourceMap!autoprefixer?{browsers:["last 2 versions", "Explorer >= 9"]}!sass?sourceMap',
          {
            publicPath: '../',
          }
        ),
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style',
          'css?sourceMap!autoprefixer?{browsers:["last 2 versions", "Explorer >= 9"]}',
          {
            publicPath: '../',
          }
        ),
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)([\?]?.*)?$/,
        loader: 'url-loader?name=assets/[name]-[hash].[ext]&limit=100000',
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
};
