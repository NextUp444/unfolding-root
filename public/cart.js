function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); updateCartCount(); }

function addToCart(productId, size = 'M', qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, size: size, qty: qty });
  }
  saveCart(cart);
  showToast(`${product.name} (${size}) added to cart`);
}


function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
  if (typeof renderCartPage === 'function') renderCartPage();
}

function updateQty(productId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) item.qty = Math.max(1, qty);
  saveCart(cart);
  if (typeof renderCartPage === 'function') renderCartPage();
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = getCart().reduce((sum, i) => sum + i.qty, 0);
}

function showToast(message) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
}

function initSearch() {
  const input = document.querySelector('.search-bar');
  if (!input) return;
  const dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';
  input.parentNode.style.position = 'relative';
  input.parentNode.appendChild(dropdown);

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.classList.remove('show'); return; }
    const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
    dropdown.innerHTML = matches.length
      ? matches.map(p => `<a href="clothing.html#${p.id}" class="search-result"><img src="${p.image}" alt=""><span>${p.name} — $${(p.price/100).toFixed(2)}</span></a>`).join('')
      : '<div class="search-result-empty">No products found</div>';
    dropdown.classList.add('show');
  });

  document.addEventListener('click', (e) => {
    if (!input.parentNode.contains(e.target)) dropdown.classList.remove('show');
  });
}

document.addEventListener('DOMContentLoaded', () => { updateCartCount(); initSearch(); });
