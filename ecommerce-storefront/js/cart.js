/**
 * Shopping Cart Management: Real-time Badge, Slide-in Drawer, Quantity, Free Shipping Bar
 */

class ShoppingCartManager {
  constructor() {
    this.storageKey = 'shopee_cart_items';
    this.items = this.loadCart();
    this.drawer = document.getElementById('cart-drawer');
    this.backdrop = document.getElementById('cart-backdrop');
    this.badgeHeaders = document.querySelectorAll('.cart-badge-count');
    this.freeShippingThreshold = 100000; // Rp100.000 for free shipping

    this.init();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Initial default items for demonstration
    return [
      {
        id: "prod-1",
        name: "Wireless ANC Bluetooth Headphone Bass Boost 40H Playtime",
        price: 249000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
        badge: "Mall",
        quantity: 1
      },
      {
        id: "prod-3",
        name: "Sunscreen Serum SPF 50+ PA++++ Hybrid Proteksi UV Ringan",
        price: 78000,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80",
        badge: "Mall",
        quantity: 2
      }
    ];
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Storage error', e);
    }
    this.updateBadges();
  }

  init() {
    this.updateBadges();
    this.bindDrawerEvents();
  }

  updateBadges() {
    const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.badgeHeaders.forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
      
      // Bouncy animation
      badge.classList.remove('badge-pop');
      void badge.offsetWidth; // trigger reflow
      badge.classList.add('badge-pop');
    });
  }

  addItem(product, qty = 1) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        badge: product.badge || '',
        quantity: qty
      });
    }
    this.saveCart();
    this.renderDrawerContent();
  }

  updateQuantity(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.items = this.items.filter(i => i.id !== id);
    }
    this.saveCart();
    this.renderDrawerContent();
  }

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.saveCart();
    this.renderDrawerContent();
  }

  openDrawer() {
    this.renderDrawerContent();
    if (this.drawer) this.drawer.classList.add('active');
    if (this.backdrop) this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    if (this.drawer) this.drawer.classList.remove('active');
    if (this.backdrop) this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  bindDrawerEvents() {
    // Open trigger icons
    document.querySelectorAll('.btn-cart-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    // Close buttons
    const closeBtn = document.getElementById('cart-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.closeDrawer());

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer?.classList.contains('active')) {
        this.closeDrawer();
      }
    });
  }

  renderDrawerContent() {
    if (!this.drawer) return;

    const listEl = this.drawer.querySelector('.cart-items-list');
    const footerEl = this.drawer.querySelector('.cart-drawer-footer');
    const freeShippingEl = this.drawer.querySelector('.cart-free-shipping-bar');

    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const neededForFreeShipping = Math.max(0, this.freeShippingThreshold - subtotal);
    const progressPercent = Math.min(100, Math.round((subtotal / this.freeShippingThreshold) * 100));

    // Update Free Shipping Bar
    if (freeShippingEl) {
      if (subtotal >= this.freeShippingThreshold) {
        freeShippingEl.innerHTML = `
          <div class="fs-bar-title text-success">
            🎉 Selamat! Anda mendapatkan <strong>GRATIS ONGKIR RP0</strong>
          </div>
          <div class="fs-bar-track"><div class="fs-bar-fill full" style="width: 100%"></div></div>
        `;
      } else {
        freeShippingEl.innerHTML = `
          <div class="fs-bar-title">
            Tambah <strong>${formatRupiah(neededForFreeShipping)}</strong> lagi untuk <strong>Gratis Ongkir!</strong>
          </div>
          <div class="fs-bar-track"><div class="fs-bar-fill" style="width: ${progressPercent}%"></div></div>
        `;
      }
    }

    if (this.items.length === 0) {
      listEl.innerHTML = `
        <div class="cart-empty-state">
          <div class="empty-icon">🛒</div>
          <p class="empty-title">Keranjang Belanja Kosong</p>
          <p class="empty-desc">Yuk jelajahi jutaan produk menarik dan promo spesial hari ini!</p>
          <button class="btn-empty-shop" id="btn-empty-shop">Mulai Belanja</button>
        </div>
      `;
      if (footerEl) footerEl.style.display = 'none';

      listEl.querySelector('#btn-empty-shop')?.addEventListener('click', () => {
        this.closeDrawer();
        document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' });
      });
      return;
    }

    if (footerEl) footerEl.style.display = 'block';

    listEl.innerHTML = this.items.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <div class="cart-item-img-wrap">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        </div>
        <div class="cart-item-details">
          ${item.badge ? `<span class="cart-item-badge">${item.badge}</span>` : ''}
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatRupiah(item.price)}</div>
          
          <div class="cart-item-actions">
            <div class="qty-control">
              <button class="qty-btn btn-minus" data-id="${item.id}">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
            </div>
            <button class="btn-item-delete" data-id="${item.id}" title="Hapus Barang">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Update Footer Subtotal & Checkout
    if (footerEl) {
      footerEl.innerHTML = `
        <div class="cart-summary-line">
          <span>Total (${this.items.reduce((s, i) => s + i.quantity, 0)} Produk):</span>
          <span class="cart-total-price">${formatRupiah(subtotal)}</span>
        </div>
        <button class="btn-checkout-primary" id="btn-checkout-action">
          Checkout Sekarang (${formatRupiah(subtotal)})
        </button>
      `;

      footerEl.querySelector('#btn-checkout-action').addEventListener('click', () => {
        this.handleCheckout(subtotal);
      });
    }

    // Bind quantity and delete buttons
    listEl.querySelectorAll('.btn-minus').forEach(btn => {
      btn.addEventListener('click', () => this.updateQuantity(btn.dataset.id, -1));
    });

    listEl.querySelectorAll('.btn-plus').forEach(btn => {
      btn.addEventListener('click', () => this.updateQuantity(btn.dataset.id, 1));
    });

    listEl.querySelectorAll('.btn-item-delete').forEach(btn => {
      btn.addEventListener('click', () => this.removeItem(btn.dataset.id));
    });
  }

  handleCheckout(total) {
    this.closeDrawer();
    window.showToast?.(`🛍️ Menuju halaman pembayaran: Total ${formatRupiah(total)}. Memproses pesanan Anda...`);
  }
}
