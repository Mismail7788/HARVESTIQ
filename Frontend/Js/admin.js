const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Auth check
if (!token || user.role !== 'admin') {
  window.location.href = 'index.html';
}

// Set user info
document.getElementById('user-name').textContent = user.name || 'Admin';
document.getElementById('avatar').textContent = (user.name || 'A')[0].toUpperCase();

// Tab switching
function showTab(tab, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (el) el.classList.add('active');
  if (tab === 'users') loadUsers();
  if (tab === 'products') loadProducts();
  if (tab === 'orders') loadOrders();
}

// Load Stats
async function loadStats() {
  try {
    const [usersRes, productsRes, ordersRes] = await Promise.all([
      fetch('http://localhost:5000/api/admin/users', { headers: { 'authorization': token } }),
      fetch('http://localhost:5000/api/products'),
      fetch('http://localhost:5000/api/orders/all', { headers: { 'authorization': token } })
    ]);

    const users = await usersRes.json();
    const products = await productsRes.json();

    document.getElementById('total-users').textContent = Array.isArray(users) ? users.length : 0;
    document.getElementById('total-products').textContent = Array.isArray(products) ? products.length : 0;
  } catch (err) {
    console.log('Stats error:', err);
  }
}

// Load Users
async function loadUsers() {
  try {
    const res = await fetch('http://localhost:5000/api/admin/users', {
      headers: { 'authorization': token }
    });
    const users = await res.json();
    const tbody = document.getElementById('users-body');

    if (!Array.isArray(users) || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:30px;">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>#${u.id}</td>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td><span class="badge badge-${u.role}">${u.role}</span></td>
        <td>${new Date(u.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('users-body').innerHTML = '<tr><td colspan="5" style="color:red;">Could not load users.</td></tr>';
  }
}

// Load Products
async function loadProducts() {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    const products = await res.json();
    const tbody = document.getElementById('products-body');

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:30px;">No products found.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td>Rs. ${p.price}</td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('products-body').innerHTML = '<tr><td colspan="4" style="color:red;">Could not load products.</td></tr>';
  }
}

// Load Orders
async function loadOrders() {
  try {
    const res = await fetch('http://localhost:5000/api/admin/orders', {
      headers: { 'authorization': token }
    });
    const orders = await res.json();
    const tbody = document.getElementById('orders-body');

    document.getElementById('total-orders').textContent = Array.isArray(orders) ? orders.length : 0;

    if (!Array.isArray(orders) || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:30px;">No orders found.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.farmer_name}</td>
        <td>${o.product_name}</td>
        <td>Rs. ${o.total_price}</td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('orders-body').innerHTML = '<tr><td colspan="5" style="color:red;">Could not load orders.</td></tr>';
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Load stats on start
loadStats();