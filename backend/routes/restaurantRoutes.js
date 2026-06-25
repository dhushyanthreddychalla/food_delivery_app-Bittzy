const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurantItems } = require('../controllers/restaurantController');

router.get('/', getRestaurants);
router.get('/:id/items', getRestaurantItems);

module.exports = router;
