/**
 * Infinite Scroll Recommendation Engine: Lazy Loading, Category Tabs, Sorting, and Card Templating
 */

class InfiniteScrollManager {
  constructor(containerId, products) {
    this.container = document.getElementById(containerId);
    this.products = products || [];
    this.filteredProducts = [...this.products];
    this.batchSize = 12;
    this.currentIndex = 0;
    this.isLoading = false;
    this.hasMore = true;
    this.currentCategory = 'Semua';
    this.currentSort = 'default';
    this.activeSearchQuery = '';

    this.gridEl = document.getElementById('recommendations-grid');
    this.sentinelEl = document.getElementById('scroll-sentinel');
    this.loaderEl = document.getElementById('infinite-loader');
    this.countEl = document.getElementById('loaded-product-counter');

    this.init();
  }

  init() {
    this.bindTabEvents();
    this.bindSortEvents();
    this.setupIntersectionObserver();
    this.loadNextBatch();
  }

  setupIntersectionObserver() {
    if (!this.sentinelEl) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !this.isLoading && this.hasMore) {
        this.loadNextBatch();
      }
    }, {
      rootMargin: '200px 0px'
    });

    observer.observe(this.sentinelEl);
  }

  bindTabEvents() {
    const tabs = document.querySelectorAll('.rec-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        this.currentCategory = tab.dataset.category || 'Semua';
        this.applyFilters();
      });
    });
  }

  bindSortEvents() {
    const sortSelect = document.getElementById('rec-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.applyFilters();
      });
    }
  }

  applySearchFilter(query) {
    this.activeSearchQuery = query.toLowerCase();
    
    // Switch tab to 'Semua' visually
    document.querySelectorAll('.rec-tab-btn').forEach(t => {
      t.classList.toggle('active', t.dataset.category === 'Semua');
    });
    this.currentCategory = 'Semua';

    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.products];

    // Filter by Category
    if (this.currentCategory !== 'Semua') {
      result = result.filter(p => p.category.toLowerCase().includes(this.currentCategory.toLowerCase()));
    }

    // Filter by Search Query
    if (this.activeSearchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(this.activeSearchQuery) ||
        p.category.toLowerCase().includes(this.activeSearchQuery) ||
        (p.location && p.location.toLowerCase().includes(this.activeSearchQuery))
      );
    }

    // Apply Sorting
    if (this.currentSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.currentSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.currentSort === 'top-sales') {
      result.sort((a, b) => b.soldCount - a.soldCount);
    } else if (this.currentSort === 'top-rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    this.filteredProducts = result;
    this.currentIndex = 0;
    this.hasMore = true;
    this.gridEl.innerHTML = '';
    
    if (this.filteredProducts.length === 0) {
      this.gridEl.innerHTML = `
        <div class="no-products-found">
          <div class="no-prod-icon">🔍</div>
          <p class="no-prod-title">Tidak ada produk ditemukan</p>
          <p class="no-prod-desc">Coba pilih kategori lain atau reset kata kunci pencarian.</p>
        </div>
      `;
      if (this.countEl) this.countEl.textContent = 'Menampilkan 0 produk';
      if (this.loaderEl) this.loaderEl.style.display = 'none';
      return;
    }

    this.loadNextBatch();
  }

  loadNextBatch() {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    if (this.loaderEl) this.loaderEl.style.display = 'flex';

    // Simulate realistic asynchronous loading delay (350ms)
    setTimeout(() => {
      const nextSlice = this.filteredProducts.slice(this.currentIndex, this.currentIndex + this.batchSize);
      
      nextSlice.forEach(product => {
        const cardNode = this.createProductCard(product);
        this.gridEl.appendChild(cardNode);
      });

      this.currentIndex += nextSlice.length;

      if (this.currentIndex >= this.filteredProducts.length) {
        this.hasMore = false;
        if (this.loaderEl) {
          this.loaderEl.innerHTML = `
            <div class="all-loaded-message">
              <span>🎉</span> Anda sudah melihat semua ${this.filteredProducts.length} rekomendasi produk!
            </div>
          `;
          this.loaderEl.style.display = 'block';
        }
      } else {
        if (this.loaderEl) this.loaderEl.style.display = 'none';
      }

      if (this.countEl) {
        this.countEl.textContent = `Menampilkan ${this.currentIndex} dari ${this.filteredProducts.length} produk`;
      }

      this.isLoading = false;
    }, 320);
  }

  createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = product.id;

    const soldFormatted = product.soldCount ? formatSoldCount(product.soldCount) : '100+ Terjual';

    let badgeHtml = '';
    if (product.badge === 'Mall') {
      badgeHtml = `<span class="badge-tag mall-tag">Shopee Mall</span>`;
    } else if (product.badge === 'Star+') {
      badgeHtml = `<span class="badge-tag star-tag">Star+</span>`;
    } else if (product.badge === 'Ad') {
      badgeHtml = `<span class="badge-tag ad-tag">Iklan</span>`;
    }

    const freeShippingTag = product.freeShipping ? `
      <span class="free-shipping-tag" title="Gratis Ongkir XTRA">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5l1.96 2.5H17V9.5h2.5zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/></svg>
        Gratis Ongkir
      </span>
    ` : '';

    const discountPill = product.discountPercent ? `
      <div class="card-discount-pill">
        <span class="discount-val">-${product.discountPercent}%</span>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="card-media">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          loading="lazy" 
          class="card-img" 
        />
        ${badgeHtml}
        ${discountPill}
        <button class="btn-quick-add" title="Tambah Cepat ke Keranjang" data-id="${product.id}" aria-label="Tambah ${product.name} ke keranjang">
          +
        </button>
      </div>
      <div class="card-body">
        <h3 class="card-title" title="${product.name}">${product.name}</h3>
        
        <div class="card-tags-row">
          ${freeShippingTag}
        </div>

        <div class="card-price-row">
          <span class="card-currency">Rp</span>
          <span class="card-price">${Number(product.price).toLocaleString('id-ID')}</span>
          ${product.originalPrice ? `<span class="card-original-price">Rp${Number(product.originalPrice).toLocaleString('id-ID')}</span>` : ''}
        </div>

        <div class="card-footer-info">
          <div class="card-rating">
            <span class="star-icon">⭐</span>
            <span class="rating-value">${product.rating || '4.9'}</span>
          </div>
          <span class="footer-separator">&bull;</span>
          <div class="card-sold">${soldFormatted}</div>
        </div>

        <div class="card-location">
          <span class="loc-pin">📍</span>
          <span class="loc-text">${product.location || 'Indonesia'}</span>
        </div>
      </div>
    `;

    // Click on entire card opens quick view
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-quick-add')) return;
      if (window.QuickViewManager) {
        window.QuickViewManager.openModal(product);
      }
    });

    // Quick add button
    const quickAddBtn = card.querySelector('.btn-quick-add');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.CartManager) {
          window.CartManager.addItem(product, 1);
          window.showToast?.(`🛒 "${product.name.substring(0, 24)}..." masuk keranjang!`);
        }
      });
    }

    return card;
  }
}
