const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: 'eval',

  entry: [
    'webpack-hot-middleware/client?reload=true&noInfo=true',
    path.join(__dirname, 'client', 'app', 'app'),
  ],

  output: {
    publicPath: '/dev/',
    path: path.join(__dirname, 'public', 'build'),
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
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['es2015', { modules: false }],
              ],
              plugins: [
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
