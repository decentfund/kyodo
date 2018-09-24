const express = require('express');
const bodyParser = require('body-parser');

const { initiateNetwork } = require('./network.js');
const { initiateIpfs } = require('./ipfs.js');
const startListener = require('./ethereumListener');

const router = require('./router.js');

const app = express();

const PORT = 3666;

app.use(bodyParser.json()).use('/', router);

app.listen(PORT, () => {
  console.log(':::INITIATING NETWORK:::');
  // initiateNetwork();
  initiateIpfs();
  console.log('::::::::RUNNING:::::::::');
});

startListener();
