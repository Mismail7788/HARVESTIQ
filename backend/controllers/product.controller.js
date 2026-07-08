const db = require('../config/db');

// Saare products dekho
const getAllProducts = (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(results);
  });
};

// Naya product add karo (Vendor)
const addProduct = (req, res) => {
  const { name, description, category, price, stock, image_url } = req.body;
  const vendor_id = req.user.id;

  db.query(
    'INSERT INTO products (vendor_id, name, description, category, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [vendor_id, name, description, category, price, stock, image_url],
    (err, result) => {
      if (err) {
        console.log('Insert Error:', err.message);
        return res.status(500).json({ message: 'Could not add product' });
      }
      res.status(201).json({ message: 'Product added successfully!', id: result.insertId });
    }
  );
};

// Product update karo
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, stock, image_url } = req.body;

  db.query(
    'UPDATE products SET name=?, description=?, category=?, price=?, stock=?, image_url=? WHERE id=? AND vendor_id=?',
    [name, description, category, price, stock, image_url, id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Could not update product' });
      res.json({ message: 'Product updated successfully!' });
    }
  );
};

// Product delete karo
const deleteProduct = (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM products WHERE id=? AND vendor_id=?',
    [id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Could not delete product' });
      res.json({ message: 'Product deleted successfully!' });
    }
  );
};

module.exports = { getAllProducts, addProduct, updateProduct, deleteProduct };