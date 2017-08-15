const express = require('express');
const http = require('http');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfigDev = require('./webpack.dev');

const webpackCompiler = webpack(webpackConfigDev);

const AceCms = require('./server/app');

const PORT = process.env.PORT || 5000;
const BASE_PATH = process.env.BASE_PATH || '/';

const app = express();

app.use(webpackDevMiddleware(webpackCompiler, {
  publicPath: webpackConfigDev.output.publicPath,
  stats: {
    colors: true,
  },
}));

app.use(webpackHotMiddleware(webpackCompiler));

const aceCms = new AceCms(app);

// app.use((req, res) => {
//   res.redirect(BASE_PATH);
// });

const server = http.createServer(aceCms);

server.on('listening', () => {
  console.log(`Express server listening on port ${PORT}`);
});

server.listen(PORT);
