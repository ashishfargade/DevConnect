const mongoose = require('mongoose');
const { mongo_URI } = require('./config.js');

const db = mongo_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(db);
        console.log("Connection to MONGODB Success");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;