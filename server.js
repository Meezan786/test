const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes'); // Import cart routes
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all origins

// Connect to MongoDB
const connectDB = async (retryCount = 5) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (err) {
    if (retryCount === 0) {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    } else {
      console.error(`MongoDB connection error. Retrying in 5 seconds... (${retryCount} retries left)`);
      setTimeout(() => connectDB(retryCount - 1), 8000);
    }
  }
};

// Initial database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes); // Add authentication routes
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/carts', cartRoutes); // Add cart routes

// Middleware to verify JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Protect routes with authentication
app.use('/api/orders', authenticateToken, orderRoutes); // Example of protected route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
