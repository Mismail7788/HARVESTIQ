const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Auth check
if (!token || user.role !== 'vendor') {
  window.location.href = 'index.html';
}

// Set user info
document.getElementById('user-name').textContent = user.name || 'Vendor';
document.getElementById('avatar').textContent = (user.name || 'V')[0].toUpperCase();

// Tab switching
function showTab(tab, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (el) el.classList.add('active');
  if (tab === 'my-products') loadMyProducts();
  if (tab === 'orders') loadOrders();
}

// Add Product
async function addProduct() {
  const name = document.getElementById('p-name').value;
  const category = document.getElementById('p-category').value;
  const price = document.getElementById('p-price').value;
  const stock = document.getElementById('p-stock').value;
  const description = document.getElementById('p-desc').value;
  const msg = document.getElementById('product-msg');

  if (!name || !price || !stock) {
    msg.className = 'message error';
    msg.textContent = 'Please fill all required fields!';
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/products/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'authorization': token },
      body: JSON.stringify({ name, category, price, stock, description, image_url: '' })
    });
    const data = await res.json();
    if (res.ok) {
      msg.className = 'message success';
      msg.textContent = '✅ Product added successfully!';
      document.getElementById('p-name').value = '';
      document.getElementById('p-price').value = '';
      document.getElementById('p-stock').value = '';
      document.getElementById('p-desc').value = '';
    } else {
      msg.className = 'message error';
      msg.textContent = data.message;
    }
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = 'Cannot connect to server!';
  }
}

// Load My Products
async function loadMyProducts() {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    const products = await res.json();
    const tbody = document.getElementById('products-body');
    const myProducts = products.filter(p => p.vendor_id === user.id);

    document.getElementById('total-products').textContent = myProducts.length;

    if (myProducts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:30px;">No products yet. Add your first product!</td></tr>';
      return;
    }

    tbody.innerHTML = myProducts.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td>Rs. ${p.price}</td>
        <td>${p.stock}</td>
        <td><button class="btn-danger" onclick="deleteProduct(${p.id})">Delete</button></td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('products-body').innerHTML = '<tr><td colspan="5" style="color:red;">Could not load products.</td></tr>';
  }
}

// Delete Product
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    const res = await fetch(`http://localhost:5000/api/products/delete/${id}`, {
      method: 'DELETE',
      headers: { 'authorization': token }
    });
    if (res.ok) { alert('Product deleted!'); loadMyProducts(); }
  } catch (err) {
    alert('Error deleting product');
  }
}

// Load Orders
async function loadOrders() {
  try {
    const res = await fetch('http://localhost:5000/api/orders/vendor-orders', {
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
        <td>${o.farmer_name}</td>
        <td>${o.product_name}</td>
        <td>${o.quantity}</td>
        <td>Rs. ${o.total_price}</td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('orders-body').innerHTML = '<tr><td colspan="6" style="color:red;">Could not load orders.</td></tr>';
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}