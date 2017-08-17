const path = require('path');
const webpack = require('webpack');
const cssNano = require('cssnano');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  devtool: 'source-map',

  entry: './client/app/app.js',

  output: {
    path: path.resolve(__dirname, 'public/build'),
    filename: 'js/bundle.js',
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new ExtractTextPlugin({
      filename: 'css/bundle.css',
      disable: false,
      allChunks: true,
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: cssNano,
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true,
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      mangle: {
        screw_ie8: true,
        keep_fnames: true,
      },
      compress: {
        screw_ie8: true,
        warnings: false,
      },
      comments: false,
    }),
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
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
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
          publicPath: '../',
        }),
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
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
          publicPath: '../',
        }),
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
