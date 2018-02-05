const express = require('express');
const http = require('http');

const AceCms = require('./server/app');

const PORT = process.env.PORT || 5000;
const CLIENT_BASE_PATH = process.env.CLIENT_BASE_PATH || '/';

const app = express();

const aceCms = new AceCms(app);

app.get('/', (req, res) => {
  res.redirect(CLIENT_BASE_PATH);
});

const server = http.createServer(aceCms);

server.on('listening', () => {
  console.log(`Running: http://localhost:${PORT + CLIENT_BASE_PATH}`);
});

server.listen(PORT);
