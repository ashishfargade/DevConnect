const dotenv = require('dotenv');
dotenv.config();

module.exports.PORT = process.env.PORT || 5000;
module.exports.mongo_URI = process.env.MONGO_URI;
