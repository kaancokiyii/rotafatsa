require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await connectDB();
        
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            const admin = await User.create({
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
            console.log('✓ Admin user created successfully!');
            console.log('Username: admin');
            console.log('Password: admin123');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
