const mongoose = require('mongoose');
require('dotenv').config();

module.exports.connect = async function() {
    try {
        console.log('Connecting to DB...', process.env.MONGO_URL)
        await mongoose.connect(process.env.MONGO_URL);
        console.log('DB Connected Successfully');
    } catch (err) {
        throw new Error(err);
        console.log(err.toString());
    }
}
