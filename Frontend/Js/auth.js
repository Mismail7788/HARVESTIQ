// Login Function
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const msg = document.getElementById('message');

  if (!email || !password) {
    showMessage('error', 'Please fill in all fields!');
    return;
  }

  const btn = document.querySelector('.btn-primary');
  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showMessage('success', 'Login successful! Redirecting...');
      setTimeout(() => {
        if (data.user.role === 'farmer') window.location.href = 'farmer.html';
        else if (data.user.role === 'vendor') window.location.href = 'vendor.html';
        else window.location.href = 'admin.html';
      }, 800);
    } else {
      showMessage('error', data.message);
      btn.textContent = 'Sign In →';
      btn.disabled = false;
    }
  } catch (err) {
    showMessage('error', 'Cannot connect to server!');
    btn.textContent = 'Sign In →';
    btn.disabled = false;
  }
}

// Signup Function
async function signup() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const role = document.getElementById('role').value;

  if (!name || !email || !password) {
    showMessage('error', 'Please fill all required fields!');
    return;
  }

  const btn = document.querySelector('.btn-primary');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, phone, address })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('success', 'Account created! Redirecting to login...');
      setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    } else {
      showMessage('error', data.message);
      btn.textContent = 'Create Account →';
      btn.disabled = false;
    }
  } catch (err) {
    showMessage('error', 'Cannot connect to server!');
    btn.textContent = 'Create Account →';
    btn.disabled = false;
  }
}

// Role Selector
function selectRole(role, el) {
  document.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('role').value = role;
}

// Show Message Helper
function showMessage(type, text) {
  const msg = document.getElementById('message');
  msg.className = 'message ' + type;
  msg.textContent = text;
}

// Enter key support
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    if (document.getElementById('name')) signup();
    else login();
  }
});