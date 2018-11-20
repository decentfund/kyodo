const NodeEnvironment = require('jest-environment-node');
const MongoMemoryServer = require('mongodb-memory-server');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const globalConfigPath = path.join(__dirname, 'globalConfig.json');

// mongoose.Promise = global.Promise;
// const mongod = new MongoMemoryServer.default({
// // instance: {
// // dbName: 'jest',
// // },
// binary: {
// version: '3.2.18',
// },

// autoStart: false,
// });

class MongoEnvironment extends NodeEnvironment {
  constructor(config) {
    console.log('constructor');
    super(config);
    this.mongod = new MongoMemoryServer.default({
      instance: {
        // settings here
        // dbName is null, so it's random
        // dbName: MONGO_DB_NAME,
      },
      binary: {
        version: '3.2.18',
      },
      // debug: true,
      autoStart: false,
    });
  }

  async setup() {
    console.log('Setup MongoDB Test Environment');
    await super.setup();

    if (!this.mongod.isRunning) {
      await this.mongod.start();
    }

    // console.log(fs.readFileSync(globalConfigPath, 'utf-8'));
    // const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf-8'));

    // console.log(globalConfig);
    // if (!globalConfig) {
    // throw new Error('wsEndpoint not found');
    // }

    const mongoUri = await this.mongod.getConnectionString();
    // const mongoConfig = {
    // mongoDBName: 'jest',
    // mongoUri,
    // };
    // const mongooseOpts = {
    // options for mongoose 4.11.3 and above
    // autoReconnect: true,
    // reconnectTries: Number.MAX_VALUE,
    // reconnectInterval: 1000,
    // };
    // console.log(mongooseOpts);
    // await mongoose
    // .connect(
    // mongoUri,
    // // mongooseOpts,
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
    // // Write global config to disk because all tests run in different contexts.
    // fs.writeFileSync(globalConfigPath, JSON.stringify(mongoConfig));
    // console.log('Config is written');
    // Set reference to mongod in order to close the server during teardown.
    // global.__MONGOD__ = this.mongod;

    this.global.__MONGO_URI__ = mongoUri;
    this.global.__MONGO_DB_NAME__ = await this.mongod.getDbName();
  }

  async teardown() {
    console.log('Teardown MongoDB Test Environment');

    await this.mongod.stop();

    this.mongod = null;
    this.global = {};

    // await mongoose.disconnect();
    // await global.__MONGOD__.stop();

    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MongoEnvironment;
