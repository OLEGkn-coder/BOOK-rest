const { MongoClient } = require('mongodb');
const config = require('./config');

const client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000 });

async function connect() {
  await client.connect();
  return client.db(config.dbName);
}

async function disconnect() {
  await client.close();
}

module.exports = { connect, disconnect };
