const path = require('path');
const webpack = require('webpack');
const cssNano = require('cssnano');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  devtool: 'source-map',

  entry: {
    vendor: ['bluebird', 'moment', 'lodash', 'angular', 'd3', 'c3'],
    app: path.resolve(__dirname, 'client/app/app.js'),
  },

  output: {
    path: path.resolve(__dirname, 'public/build'),
    filename: 'js/bundle.[chunkhash].js',
  },

  plugins: [
    // new BundleAnalyzerPlugin(),
    new CleanWebpackPlugin([path.resolve(__dirname, 'public/build')]),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'js/vendor.[chunkhash].js',
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: cssNano,
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true,
    }),
    new ExtractTextPlugin({
      filename: 'css/bundle.[chunkhash].css',
      disable: false,
      allChunks: true,
    }),
    new UglifyJsPlugin({
      sourceMap: true,
      uglifyOptions: {
        mangle: {
          keep_fnames: true,
        },
        compress: {
          warnings: false,
        },
        comments: false,
      },
    }),
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
        test: /\.(jade|pug)$/,
        use: [
          'raw-loader',
          'pug-html-loader',
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
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                plugins: () => [
                  require('autoprefixer')(),
                ],
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
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                plugins: () => [
                  require('autoprefixer')(),
                ],
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
