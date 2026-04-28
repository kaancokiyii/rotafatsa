require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');

const checkUsers = async () => {
    try {
        await connectDB();
        const users = await User.find({}, 'username role');
        console.log('Current users in DB:', JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
