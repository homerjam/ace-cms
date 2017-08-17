const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  // devtool: 'inline-source-map',

  entry: [
    'webpack-hot-middleware/client?reload=true&noInfo=true',
    './client/app/app.js',
  ],

  output: {
    path: '/',
    publicPath: '/dev/',
    filename: 'js/bundle.js',
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: {
          test: path.resolve(__dirname, 'node_modules'),
          exclude: path.resolve(__dirname, 'node_modules/icc'),
        },
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'es2017'],
              plugins: [
                'transform-runtime',
                ['angularjs-annotate', { explicitOnly: false }],
              ],
            },
          },
        ],
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
      },
      {
        test: /\.jade$/,
        use: [
          'raw-loader',
          'jade-html-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'autoprefixer-loader',
            options: {
              browsers: ['last 2 versions', 'Explorer >= 9'],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'autoprefixer-loader',
            options: {
              browsers: ['last 2 versions', 'Explorer >= 9'],
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)([?]?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'assets/[name]-[hash].[ext]',
          limit: 100000,
        },
      },
    ],
  },
};
