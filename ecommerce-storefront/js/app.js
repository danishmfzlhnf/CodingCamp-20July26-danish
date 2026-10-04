/**
 * Main Application Orchestrator & UI Interaction Manager
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Image Error Fallback Handler
  document.addEventListener('error', (e) => {
    if (e.target && e.target.tagName === 'IMG' && !e.target.dataset.fallbackTried) {
      e.target.dataset.fallbackTried = 'true';
      if (typeof FALLBACK_PRODUCT_IMAGE !== 'undefined') {
        e.target.src = FALLBACK_PRODUCT_IMAGE;
      }
    }
  }, true);

  // 1. Initialize Toast System
  initToastSystem();

  // 2. Initialize Shopping Cart
  window.CartManager = new ShoppingCartManager();

  // 3. Initialize Quick View Modal
  window.QuickViewManager = new QuickViewManager();

  // 4. Initialize Hero Carousel
  if (ECOMMERCE_DATA.banners && ECOMMERCE_DATA.banners.length > 0) {
    new HeroCarousel('hero-carousel', {
      banners: ECOMMERCE_DATA.banners,
      interval: 4000
    });
  }

  // 5. Render Shortcut Menus
  renderShortcutMenus();

  // 6. Initialize Flash Sale
  new FlashSaleManager('flash-sale', ECOMMERCE_DATA.flashSaleItems);

  // 7. Initialize Voucher Wallet
  new VoucherManager('vouchers-section', ECOMMERCE_DATA.vouchers);

  // 8. Render Categories & Trending Searches
  renderCategories();
  renderTrendingSearches();

  // 9. Initialize Infinite Scroll Recommendations
  window.InfiniteScrollManager = new InfiniteScrollManager('recommendations', ECOMMERCE_DATA.recommendedProducts);

  // 10. Initialize Smart Search Bar
  new SmartSearchManager('#global-search-input', '#search-suggest-dropdown', ECOMMERCE_DATA.recommendedProducts);

  // 11. Initialize Header Drawers (Notifications & QR App Download)
  initHeaderDrawers();

  // 12. Initialize Mobile Bottom Navigation
  initMobileBottomNav();

  // 13. Back to Top Button
  initBackToTop();
});

/**
 * Toast Notification System
 */
function initToastSystem() {
  const toastContainer = document.getElementById('toast-container');

  window.showToast = (message, duration = 3000) => {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'shopee-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-text">${message}</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };
}

/**
 * Render Shortcut Menu Grid (10 items, 2 rows)
 */
function renderShortcutMenus() {
  const container = document.getElementById('shortcut-grid-menu');
  if (!container || !ECOMMERCE_DATA.shortcutMenus) return;

  container.innerHTML = ECOMMERCE_DATA.shortcutMenus.map(m => `
    <a href="#recommendations" class="shortcut-item" data-id="${m.id}">
      <div class="shortcut-icon-wrap" style="background-color: ${m.iconBg}; color: ${m.iconColor}">
        ${m.iconSvg}
        ${m.badge ? `<span class="shortcut-badge">${m.badge}</span>` : ''}
      </div>
      <span class="shortcut-title">${m.title}</span>
    </a>
  `).join('');

  container.querySelectorAll('.shortcut-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const title = item.querySelector('.shortcut-title').textContent;
      window.showToast(`✨ Membuka promo kategori: ${title}`);
    });
  });
}

/**
 * Render Kategori Pilihan (Horizontal scrollable tiles)
 */
function renderCategories() {
  const container = document.getElementById('categories-track');
  if (!container || !ECOMMERCE_DATA.categories) return;

  container.innerHTML = ECOMMERCE_DATA.categories.map(c => `
    <div class="category-tile" data-category="${c.name}">
      <div class="cat-img-box">
        <img src="${c.image}" alt="${c.name}" loading="lazy" class="cat-img" />
      </div>
      <div class="cat-name">${c.name}</div>
      <div class="cat-count">${c.count}</div>
    </div>
  `).join('');

  container.querySelectorAll('.category-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const catName = tile.dataset.category;
      if (window.InfiniteScrollManager) {
        window.InfiniteScrollManager.applySearchFilter(catName);
        document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Scroll buttons for categories
  const prevBtn = document.getElementById('cat-scroll-prev');
  const nextBtn = document.getElementById('cat-scroll-next');
  if (prevBtn) prevBtn.addEventListener('click', () => container.scrollBy({ left: -240, behavior: 'smooth' }));
  if (nextBtn) nextBtn.addEventListener('click', () => container.scrollBy({ left: 240, behavior: 'smooth' }));
}

/**
 * Render Pencarian Populer (Top Searches)
 */
function renderTrendingSearches() {
  const container = document.getElementById('trending-searches-grid');
  if (!container || !ECOMMERCE_DATA.trendingSearches) return;

  container.innerHTML = ECOMMERCE_DATA.trendingSearches.map(t => `
    <div class="trending-card" data-keyword="${t.keyword}">
      <div class="trend-card-left">
        <span class="trend-rank-tag">#${t.rank}</span>
        <div class="trend-card-title">${t.keyword}</div>
        <div class="trend-card-vol">${t.volume}</div>
      </div>
      <div class="trend-card-right">
        <img src="${t.image}" alt="${t.keyword}" loading="lazy" class="trend-card-img" />
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.trending-card').forEach(card => {
    card.addEventListener('click', () => {
      const kw = card.dataset.keyword;
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.value = kw;
      if (window.InfiniteScrollManager) {
        window.InfiniteScrollManager.applySearchFilter(kw);
        document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Notifications Drawer & Download QR Modal
 */
function initHeaderDrawers() {
  // Notifications Popover / Drawer
  const notifBtn = document.getElementById('btn-notifications');
  const notifModal = document.getElementById('notifications-modal');
  const notifBackdrop = document.getElementById('notif-backdrop');
  const notifClose = document.getElementById('notif-close-btn');
  const notifList = document.getElementById('notif-items-list');

  if (notifList && ECOMMERCE_DATA.notifications) {
    notifList.innerHTML = ECOMMERCE_DATA.notifications.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}">
        <span class="notif-icon">${n.icon}</span>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join('');
  }

  const openNotif = () => {
    if (notifModal) notifModal.classList.add('active');
    if (notifBackdrop) notifBackdrop.classList.add('active');
    // Clear unread badge
    const badge = document.getElementById('notif-badge-count');
    if (badge) badge.style.display = 'none';
  };

  const closeNotif = () => {
    if (notifModal) notifModal.classList.remove('active');
    if (notifBackdrop) notifBackdrop.classList.remove('active');
  };

  if (notifBtn) notifBtn.addEventListener('click', openNotif);
  if (notifClose) notifClose.addEventListener('click', closeNotif);
  if (notifBackdrop) notifBackdrop.addEventListener('click', closeNotif);

  // App Download QR Modal
  const qrBtn = document.getElementById('btn-download-app');
  const qrModal = document.getElementById('qr-modal');
  const qrBackdrop = document.getElementById('qr-backdrop');
  const qrClose = document.getElementById('qr-close-btn');

  const openQr = (e) => {
    e.preventDefault();
    if (qrModal) qrModal.classList.add('active');
    if (qrBackdrop) qrBackdrop.classList.add('active');
  };

  const closeQr = () => {
    if (qrModal) qrModal.classList.remove('active');
    if (qrBackdrop) qrBackdrop.classList.remove('active');
  };

  if (qrBtn) qrBtn.addEventListener('click', openQr);
  if (qrClose) qrClose.addEventListener('click', closeQr);
  if (qrBackdrop) qrBackdrop.addEventListener('click', closeQr);
}

/**
 * Mobile Sticky Bottom Navigation
 */
function initMobileBottomNav() {
  const navItems = document.querySelectorAll('.bottom-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const target = item.dataset.target;

      if (target === 'cart') {
        e.preventDefault();
        window.CartManager?.openDrawer();
        return;
      }

      if (target === 'notif') {
        e.preventDefault();
        document.getElementById('btn-notifications')?.click();
        return;
      }

      if (target === 'live') {
        e.preventDefault();
        window.showToast('📺 Shopee Live Streaming: Diskon Spesial 50% sedang berlangsung!');
        return;
      }

      if (target === 'profile') {
        e.preventDefault();
        window.showToast('👤 Profil Pengguna: Saldo ShopeePay Rp245.000 | 125 Koin Shopee');
        return;
      }

      // Default: Beranda
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/**
 * Floating Back-to-Top Button
 */
function initBackToTop() {
  const btn = document.getElementById('btn-back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
