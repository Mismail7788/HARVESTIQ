const db = require('../config/db');

// Saare users dekho
const getAllUsers = (req, res) => {
  db.query('SELECT id, name, email, role, phone, address, created_at FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(results);
  });
};

// Saare orders dekho
const getAllOrders = (req, res) => {
  db.query(
    `SELECT o.id, o.total_price, o.status, o.created_at,
     u.name as farmer_name,
     p.name as product_name,
     oi.quantity
     FROM orders o
     JOIN users u ON o.farmer_id = u.id
     JOIN order_items oi ON o.id = oi.order_id
     JOIN products p ON oi.product_id = p.id`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json(results);
    }
  );
};

// User delete karo
const deleteUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Could not delete user' });
    res.json({ message: 'User deleted successfully!' });
  });
};

module.exports = { getAllUsers, getAllOrders, deleteUser };