require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const users = await User.find({}).lean();
    console.log('===== USERS =====');
    console.log(JSON.stringify(users, null, 2));
    console.log('=================');
    process.exit(0);
});
