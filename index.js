const express = require('express');
const http = require('http');

const AceCms = require('./server/app');

const PORT = process.env.PORT || 5000;

const app = express();

const aceCms = new AceCms(app);

const server = http.createServer(aceCms);

server.on('listening', () => {
  console.log(`Express server listening on port ${PORT}`);
});

server.listen(PORT);
