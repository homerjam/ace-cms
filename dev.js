const http = require('http');
const express = require('express');
const opn = require('opn');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfigDev = require('./webpack.dev');

const webpackCompiler = webpack(webpackConfigDev);

const AceCms = require('./server/app');

const PORT = process.env.PORT || 5000;
const CLIENT_BASE_PATH = process.env.CLIENT_BASE_PATH || '/';
const DEV_SLUG = process.env.DEV_SLUG || '';

const app = express();

app.use(webpackDevMiddleware(webpackCompiler, {
  publicPath: webpackConfigDev.output.publicPath,
  stats: {
    colors: true,
  },
}));

app.use(webpackHotMiddleware(webpackCompiler));

const aceCms = new AceCms(app);

const server = http.createServer(aceCms);

server.on('listening', () => {
  console.log(`Running: http://localhost:${PORT + CLIENT_BASE_PATH + DEV_SLUG}`);

  // opn(`http://localhost:${PORT + CLIENT_BASE_PATH + DEV_SLUG}`);
});

server.listen(PORT);
