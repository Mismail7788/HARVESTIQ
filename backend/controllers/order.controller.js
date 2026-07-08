const db = require('../config/db');

// Order banao
const createOrder = (req, res) => {
  const farmer_id = req.user.id;
  const { items } = req.body;
  // items = [{ product_id, quantity, price }]

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }

  const total_price = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  db.query(
    'INSERT INTO orders (farmer_id, total_price) VALUES (?, ?)',
    [farmer_id, total_price],
    (err, result) => {
      if (err) {
        console.log('Order Error:', err.message);
        return res.status(500).json({ message: 'Could not create order' });
      }

      const order_id = result.insertId;
      const orderItems = items.map(item => [order_id, item.product_id, item.quantity, item.price]);

      db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
        [orderItems],
        (err) => {
          if (err) {
            console.log('Order Items Error:', err.message);
            return res.status(500).json({ message: 'Could not save order items' });
          }
          res.status(201).json({ message: 'Order placed successfully!', order_id });
        }
      );
    }
  );
};

// Farmer ke saare orders dekho
const getMyOrders = (req, res) => {
  const farmer_id = req.user.id;

  db.query(
    `SELECT o.id, o.total_price, o.status, o.created_at,
     oi.quantity, oi.price, p.name as product_name
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     JOIN products p ON oi.product_id = p.id
     WHERE o.farmer_id = ?`,
    [farmer_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json(results);
    }
  );
};

// Vendor ke orders dekho
const getVendorOrders = (req, res) => {
  const vendor_id = req.user.id;

  db.query(
    `SELECT o.id, o.total_price, o.status, o.created_at,
     oi.quantity, oi.price, p.name as product_name, u.name as farmer_name
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     JOIN products p ON oi.product_id = p.id
     JOIN users u ON o.farmer_id = u.id
     WHERE p.vendor_id = ?`,
    [vendor_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json(results);
    }
  );
};

// Order status update karo
const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Could not update status' });
      res.json({ message: 'Order status updated!' });
    }
  );
};

module.exports = { createOrder, getMyOrders, getVendorOrders, updateOrderStatus };