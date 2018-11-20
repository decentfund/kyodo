import mongoose from 'mongoose';
import { Colony, User, Domain } from '../../db';

const mongooseOptions = {
  autoIndex: false,
  autoReconnect: false,
  connectTimeoutMS: 10000,
};

// Just in case want to debug something
// mongoose.set('debug', true);

export async function connectMongoose() {
  jest.setTimeout(20000);
  return mongoose.connect(
    global.__MONGO_URI__,
    {
      ...mongooseOptions,
      dbName: global.__MONGO_DB_NAME__,
    },
  );
}

export async function clearDatabase() {
  await mongoose.connection.db.dropDatabase();
}

export async function disconnectMongoose() {
  await mongoose.disconnect();
  mongoose.connections.forEach(connection => {
    const modelNames = Object.keys(connection.models);

    modelNames.forEach(modelName => {
      delete connection.models[modelName];
    });

    const collectionNames = Object.keys(connection.collections);
    collectionNames.forEach(collectionName => {
      delete connection.collections[collectionName];
    });
  });

  const modelSchemaNames = Object.keys(mongoose.modelSchemas);
  modelSchemaNames.forEach(modelSchemaName => {
    delete mongoose.modelSchemas[modelSchemaName];
  });
}

export async function clearDb() {
  await clearDatabase();
}

export async function createColony() {
  const colony = new Colony({ colonyId: 0, periodIds: [0] });
  await colony.save();
}

export async function createDomain() {
  const domain = new Domain({ domainTitle: 'GOV', domainId: 1, potId: 1 });
  await domain.save();
  return domain;
}

export async function createUser() {
  const user = new User({
    alias: 'user',
  });
  await user.save();

  return user;
}
