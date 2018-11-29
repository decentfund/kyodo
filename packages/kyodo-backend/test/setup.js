import 'babel-polyfill';
import MongoMemoryServer from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer({ binary: { version: '3.2.18' } });
  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(
    mongoUri,
    {},
    err => {
      if (err) console.error(err);
    },
  );
  // connection = await mongoose.connect(global.__MONGO_URI__);
});

afterAll(done => {
  mongoose.disconnect(done);
  mongoServer.stop();
});
