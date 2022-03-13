const mongoose = require('mongoose');

module.exports.connectDB = async function () {
  let db = await mongoose.connect(process.env.MONGODB_URL);
  console.log('DB connected!!!');
  return db;
};
