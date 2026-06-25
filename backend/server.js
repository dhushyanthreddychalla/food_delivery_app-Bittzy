const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// We will create these shortly
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('Food Delivery APP API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
