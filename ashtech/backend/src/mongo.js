const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ashtech';

const connectDB = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ MongoDB connected');
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection failed (attempt ${i + 1}):`, err.message);
      if (i === retries - 1) {
        console.error('🛑 Max retries reached. Exiting...');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, delay * (i + 1))); // Exponential backoff
    }
  }
};

module.exports = connectDB;
