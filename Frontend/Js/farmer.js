const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Set user info
document.getElementById('user-name').textContent = user.name || 'Farmer';
document.getElementById('avatar').textContent = (user.name || 'F')[0].toUpperCase();

// Tab switching
function showTab(tab, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (el) el.classList.add('active');
  if (tab === 'marketplace') loadProducts();
  if (tab === 'orders') loadOrders();
}

// Load Products
async function loadProducts() {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    const products = await res.json();
    const grid = document.getElementById('products-grid');

    if (products.length === 0) {
      grid.innerHTML = '<p style="color:#999;padding:20px;">No products available yet.</p>';
      return;
    }

    const emojis = { fertilizer: '🌿', pesticide: '🧪', seed: '🌱', equipment: '🚜' };

    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <div class="product-emoji">${emojis[p.category] || '📦'}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-category">${p.category}</div>
        <div class="product-price">Rs. ${p.price}</div>
        <button class="btn-sm" style="width:100%;margin-top:10px;" onclick="placeOrder(${p.id}, ${p.price})">Order Now</button>
      </div>
    `).join('');
  } catch (err) {
    document.getElementById('products-grid').innerHTML = '<p style="color:red;">Could not load products.</p>';
  }
}

// Place Order
async function placeOrder(productId, price) {
  try {
    const res = await fetch('http://localhost:5000/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'authorization': token },
      body: JSON.stringify({ items: [{ product_id: productId, quantity: 1, price }] })
    });
    const data = await res.json();
    if (res.ok) alert('✅ Order placed successfully!');
    else alert('❌ ' + data.message);
  } catch (err) {
    alert('Cannot connect to server!');
  }
}

// Load Orders
async function loadOrders() {
  try {
    const res = await fetch('http://localhost:5000/api/orders/my-orders', {
      headers: { 'authorization': token }
    });
    const orders = await res.json();
    const tbody = document.getElementById('orders-body');

    document.getElementById('total-orders').textContent = orders.length;

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:30px;">No orders yet.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.product_name}</td>
        <td>${o.quantity}</td>
        <td>Rs. ${o.total_price}</td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('orders-body').innerHTML = '<tr><td colspan="6" style="color:red;padding:20px;">Could not load orders.</td></tr>';
  }
}

// AI Scan
async function scanImage(input) {
  const file = input.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  const result = document.getElementById('scan-result');
  result.className = 'scan-result show';
  document.getElementById('disease-name').textContent = '🔄 Analyzing image... please wait';
  document.getElementById('confidence-text').textContent = '';
  document.getElementById('advisory-text').textContent = '';

  try {
    const res = await fetch('http://127.0.0.1:5001/predict', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      document.getElementById('disease-name').textContent = '❌ Server error: ' + res.status;
      return;
    }

    const data = await res.json();

    if (data.error) {
      document.getElementById('disease-name').textContent = '❌ Error: ' + data.error;
      return;
    }

    document.getElementById('disease-name').textContent = '🌿 ' + data.disease.replace(/_/g, ' ');
    document.getElementById('confidence-text').textContent = `Confidence: ${data.confidence}%`;
    document.getElementById('conf-bar').style.width = data.confidence + '%';
    document.getElementById('advisory-text').textContent = '💡 Advisory: ' + data.advisory;

    const scans = parseInt(localStorage.getItem('scans') || 0) + 1;
    localStorage.setItem('scans', scans);
    document.getElementById('total-scans').textContent = scans;

  } catch (err) {
    console.log('Scan error:', err);
    document.getElementById('disease-name').textContent = '❌ Cannot connect to AI service!';
    document.getElementById('confidence-text').textContent = 'Make sure AI server is running on port 5001';
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}
