// Makes an existing user an admin.
// Usage (from the backend folder):  npm run make-admin -- your@email.com
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const makeAdmin = async () => {
  const email = process.argv[2];
  if (!email) {
    console.log('Please give an email. Example: npm run make-admin -- your@email.com');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.log(`No user found with email ${email}. Sign up first, then run this again.`);
  } else {
    console.log(`Done. ${user.name} (${user.email}) is now an admin.`);
  }
  await mongoose.disconnect();
};

makeAdmin();
