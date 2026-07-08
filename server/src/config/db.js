const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(process.env.MONGO_URI);

  logger.info(`MongoDB connected: ${conn.connection.host}`);

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  return conn;
};

module.exports = connectDB;
