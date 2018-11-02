import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { initiateNetwork } from './network.js';
import { initiateIpfs } from './ipfs.js';
import startListener from './ethereumListener';
import { initDb } from './db';

import router from './router.js';

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
