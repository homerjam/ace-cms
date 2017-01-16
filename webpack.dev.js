const webpack = require('webpack');
const path = require('path');

module.exports = {
  debug: true,
  // devtool: 'eval-source-map',
  devtool: 'eval',

  entry: [
    // 'webpack/hot/dev-server',
    'webpack-hot-middleware/client?reload=true&noInfo=true',
    path.join(__dirname, 'client', 'app', 'app'),
  ],

  output: {
    publicPath: '/dev/',
    path: path.join(__dirname, 'public', 'build'),
    filename: 'js/bundle.js',
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  // new webpack.ProvidePlugin({
  //   jQuery: 'jquery',
  //   $: 'jquery',
  //   'window.jQuery': 'jquery',
  // }),
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
          // 'monkey-hot',
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
        loaders: ['style', 'css?sourceMap', 'autoprefixer?{browsers:["last 2 versions", "Explorer >= 9"]}', 'sass?sourceMap'],
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css?sourceMap', 'autoprefixer?{browsers:["last 2 versions", "Explorer >= 9"]}'],
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
