const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Default developer user
const defaultUser = {
    name: 'SparkPair',
    username: 'sparkpair',
    password: 'sparkpair',
    role: 'developer',
    isActive: true
};

// Import data
const importData = async () => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username: 'sparkpair' });
        
        if (existingUser) {
            console.log('Default user already exists');
        } else {
            await User.create(defaultUser);
            console.log('Default user created successfully');
        }

        console.log('Data imported successfully');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await User.deleteMany({ username: { $ne: 'sparkpair' } });
        console.log('Data deleted (except default user)');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Run based on argument
if (process.argv[2] === '-d') {
    deleteData();
} else {
    importData();
}
