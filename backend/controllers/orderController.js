const db = require('../config/db');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, totalPrice } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const [result] = await db.execute(
      'INSERT INTO orders (user_id, items, total_price, status) VALUES (?, ?, ?, ?)',
      [req.user.id, JSON.stringify(items), totalPrice, 'Pending']
    );

    res.status(201).json({
      message: 'Order created',
      orderId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const [orders] = await db.execute('SELECT * FROM orders WHERE user_id = ?', [req.user.id]);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders
};
