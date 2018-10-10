const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { initiateNetwork } = require('./network.js');
const { initiateIpfs } = require('./ipfs.js');
const startListener = require('./ethereumListener');
const { initDb } = require('./db');

const router = require('./router.js');

const app = express();

const PORT = 3666;

app.use(cors());
app.use(bodyParser.json()).use('/', router);

app.listen(PORT, () => {
  console.log(':::INITIATING NETWORK:::');
  initDb();
  // initiateNetwork();
  initiateIpfs();
  console.log('::::::::RUNNING:::::::::');
});

startListener();
