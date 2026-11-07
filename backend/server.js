// Entry point of the backend. Run with: npm run dev
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // loads values from .env

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');
const flagRoutes = require('./routes/flagRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();

// Allow the React app to call this API
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
// Read JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'ReFound API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/admin', adminRoutes);

// These two must stay at the bottom
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
