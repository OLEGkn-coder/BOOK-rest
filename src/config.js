require('dotenv').config({ quiet: true });

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
  dbName: process.env.DB_NAME || 'library',
};
