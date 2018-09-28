const path = require('path');
const fs = require('fs');
const MongodbMemoryServer = require('mongodb-memory-server');
const mongoose = require('mongoose');
const globalConfigPath = path.join(__dirname, 'globalConfig.json');

mongoose.Promise = global.Promise;

const mongod = new MongodbMemoryServer.default({
  instance: {
    dbName: 'jest',
  },
  binary: {
    version: '3.2.18',
  },
});

module.exports = async function() {
  console.log('starting');
  const mongoUri = await mongod.getConnectionString();
  const mongoConfig = {
    mongoDBName: 'jest',
    mongoUri,
  };

  const mongooseOpts = {
    // options for mongoose 4.11.3 and above
    // autoReconnect: true,
    // reconnectTries: Number.MAX_VALUE,
    // reconnectInterval: 1000,
  };

  console.log(mongooseOpts);

  // await mongoose
  // .connect(
  // mongoUri,
  // mongooseOpts,
  // )
  // .then(
  // () => console.log('!!!Mongo DB is ready.'),
  // error => console.error(error),
  // );

  // console.log('mongoose connecting');

  // mongoose.connection.on('error', e => {
  // if (e.message.code === 'ETIMEDOUT') {
  // console.log(e);
  // mongoose.connect(
  // mongoUri,
  // mongooseOpts,
  // );
  // }
  // console.log(e);
  // });

  // mongoose.connection.once('open', () => {
  // console.log(`MongoDB successfully connected to ${mongoUri}`);
  // });

  // Write global config to disk because all tests run in different contexts.
  fs.writeFileSync(globalConfigPath, JSON.stringify(mongoConfig));
  // console.log('Config is written');

  // Set reference to mongod in order to close the server during teardown.
  global.__MONGOD__ = mongod;
  // global.__MONGO_URI__ = mongoConfig.mongoUri;
  // global.__MONGO_DB_NAME__ = mongoConfig.mongoDBName;
  // console.log(global);
};
