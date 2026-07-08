const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// SIGNUP
const signup = (req, res) => {
  const { name, email, password, role, phone, address } = req.body;
  
  console.log('Signup attempt:', email);
  console.log('DB object:', db);

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.log('DB Error:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
      'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, phone, address],
      (err, result) => {
        if (err) {
          console.log('Insert Error:', err.message);
          return res.status(500).json({ message: 'Could not create user' });
        }
        console.log('User inserted! ID:', result.insertId);
        res.status(201).json({ message: 'User created successfully!' });
      }
    );
  });
};

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Wrong password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
};

module.exports = { signup, login };