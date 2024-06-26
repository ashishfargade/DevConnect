const dotenv = require('dotenv');
dotenv.config();

module.exports.mongo_URI = process.env.MONGO_URI;
module.exports.jwtSecret = process.env.jwtSecret;
module.exports.githubClientId = process.env.githubClientId;
module.exports.githubSecret = process.env.githubSecret;
module.exports.githubCientId = process.env.githubCientId;
module.exports.githubClientSecret = process.env.githubClientSecret;