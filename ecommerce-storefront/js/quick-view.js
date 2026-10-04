/**
 * Quick View Product Detail Modal
 */

class QuickViewManager {
  constructor() {
    this.modal = document.getElementById('quickview-modal');
    this.backdrop = document.getElementById('quickview-backdrop');
    this.container = document.getElementById('quickview-content');
    this.closeBtn = document.getElementById('quickview-close');

    this.currentProduct = null;
    this.selectedQuantity = 1;

    this.init();
  }

  init() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.closeModal());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  openModal(product) {
    this.currentProduct = product;
    this.selectedQuantity = 1;
    this.render();

    if (this.modal) this.modal.classList.add('active');
    if (this.backdrop) this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
    if (this.backdrop) this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  render() {
    if (!this.container || !this.currentProduct) return;

    const p = this.currentProduct;
    const soldFormatted = p.soldCount ? formatSoldCount(p.soldCount) : '1.2RB Terjual';
    const ratingStars = '★'.repeat(Math.floor(p.rating || 5)) + '☆'.repeat(5 - Math.floor(p.rating || 5));

    this.container.innerHTML = `
      <div class="qv-grid">
        <!-- Product Image Gallery -->
        <div class="qv-gallery">
          <div class="qv-main-img-wrap">
            <img src="${p.image}" alt="${p.name}" class="qv-main-img" id="qv-main-image" />
            ${p.badge ? `<span class="qv-badge">${p.badge}</span>` : ''}
          </div>
          <div class="qv-thumbs">
            <img src="${p.image}" alt="Thumb 1" class="qv-thumb active" />
            <img src="${p.image}?auto=format&fit=crop&w=400&q=70" alt="Thumb 2" class="qv-thumb" />
          </div>
        </div>

        <!-- Product Specs & Buying Options -->
        <div class="qv-info">
          <h2 class="qv-title">${p.name}</h2>

          <div class="qv-ratings-row">
            <span class="qv-stars">${ratingStars}</span>
            <span class="qv-rating-num">${p.rating || '4.9'}</span>
            <span class="qv-divider">|</span>
            <span class="qv-reviews">${p.reviewCount || 820} Penilaian</span>
            <span class="qv-divider">|</span>
            <span class="qv-sold">${soldFormatted}</span>
          </div>

          <div class="qv-price-box">
            <span class="qv-currency">Rp</span>
            <span class="qv-price">${Number(p.price).toLocaleString('id-ID')}</span>
            ${p.originalPrice ? `
              <span class="qv-orig-price">Rp${Number(p.originalPrice).toLocaleString('id-ID')}</span>
              <span class="qv-discount-pill">-${p.discountPercent || 40}%</span>
            ` : ''}
          </div>

          <div class="qv-perks-row">
            <div class="qv-perk-item">
              <span class="perk-icon">🚚</span>
              <div>
                <strong>Gratis Ongkir</strong>
                <p>Ongkir s/d Rp40.000 dengan min. belanja Rp0</p>
              </div>
            </div>
            <div class="qv-perk-item">
              <span class="perk-icon">🛡️</span>
              <div>
                <strong>Garansi 100% Original Shopee Mall</strong>
                <p>Jaminan pengembalian 2x lipat jika barang palsu</p>
              </div>
            </div>
            <div class="qv-perk-item">
              <span class="perk-icon">📍</span>
              <div>
                <strong>Dikirim dari:</strong>
                <p>${p.location || 'Kota Jakarta'}</p>
              </div>
            </div>
          </div>

          <div class="qv-desc">
            <p>${p.description || 'Produk terlaris kualitas original dengan garansi resmi dan pengiriman super cepat.'}</p>
          </div>

          <!-- Quantity Picker -->
          <div class="qv-qty-row">
            <span class="qv-qty-label">Kuantitas:</span>
            <div class="qty-control">
              <button class="qty-btn" id="qv-minus-btn">-</button>
              <span class="qty-value" id="qv-qty-value">${this.selectedQuantity}</span>
              <button class="qty-btn" id="qv-plus-btn">+</button>
            </div>
            <span class="qv-stock-hint">Tersisa ${p.stock || 99} buah</span>
          </div>

          <!-- CTA Buttons -->
          <div class="qv-actions">
            <button class="btn-qv-cart" id="qv-add-cart-btn">
              <span>🛒</span> Masukkan Keranjang
            </button>
            <button class="btn-qv-buy" id="qv-buy-now-btn">
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
    `;

    // Quantity buttons
    const minusBtn = this.container.querySelector('#qv-minus-btn');
    const plusBtn = this.container.querySelector('#qv-plus-btn');
    const qtyVal = this.container.querySelector('#qv-qty-value');

    minusBtn.addEventListener('click', () => {
      if (this.selectedQuantity > 1) {
        this.selectedQuantity--;
        qtyVal.textContent = this.selectedQuantity;
      }
    });

    plusBtn.addEventListener('click', () => {
      if (this.selectedQuantity < (p.stock || 99)) {
        this.selectedQuantity++;
        qtyVal.textContent = this.selectedQuantity;
      }
    });

    // Add to Cart
    this.container.querySelector('#qv-add-cart-btn').addEventListener('click', () => {
      if (window.CartManager) {
        window.CartManager.addItem(p, this.selectedQuantity);
        this.closeModal();
        window.showToast?.(`🛍️ Ditambahkan ${this.selectedQuantity}x "${p.name.substring(0, 24)}..." ke keranjang!`);
      }
    });

    // Buy Now
    this.container.querySelector('#qv-buy-now-btn').addEventListener('click', () => {
      if (window.CartManager) {
        window.CartManager.addItem(p, this.selectedQuantity);
        this.closeModal();
        window.CartManager.openDrawer();
      }
    });
  }
}
