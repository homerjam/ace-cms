const express = require('express');
const http = require('http');

const AceCms = require('./server/app');

const PORT = process.env.PORT || 5000;
const BASE_PATH = process.env.BASE_PATH || '/';

const app = express();

const aceCms = new AceCms(app);

app.use((req, res) => {
  res.redirect(BASE_PATH);
});

const server = http.createServer(aceCms);

server.on('listening', () => {
  console.log(`Express server listening on port ${PORT}`);
});

server.listen(PORT);
