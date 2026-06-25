const db = require('../config/db');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    const [restaurants] = await db.execute('SELECT * FROM restaurants');
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get items for a restaurant
// @route   GET /api/restaurants/:id/items
// @access  Public
const getRestaurantItems = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await db.execute('SELECT * FROM food_items WHERE restaurant_id = ?', [id]);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantItems
};
