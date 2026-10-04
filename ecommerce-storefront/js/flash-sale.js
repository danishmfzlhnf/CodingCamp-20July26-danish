/**
 * Flash Sale Section Logic: Real-time Countdown Timer & Horizontal Scroll Controls
 */

class FlashSaleManager {
  constructor(sectionId, items) {
    this.section = document.getElementById(sectionId);
    if (!this.section) return;

    this.items = items || [];
    this.container = this.section.querySelector('.flash-sale-track');
    this.prevBtn = this.section.querySelector('.fs-nav-prev');
    this.nextBtn = this.section.querySelector('.fs-nav-next');
    this.timerEl = {
      hours: this.section.querySelector('.timer-box.hours'),
      minutes: this.section.querySelector('.timer-box.minutes'),
      seconds: this.section.querySelector('.timer-box.seconds')
    };

    this.init();
  }

  init() {
    this.renderItems();
    this.startCountdown();
    this.bindScrollEvents();
  }

  renderItems() {
    if (!this.container) return;

    this.container.innerHTML = this.items.map(item => {
      const soldRatio = Math.min(100, Math.round((item.soldCount / item.stockTotal) * 100));
      const isAlmostGone = soldRatio >= 85 || item.stockStatus.includes('HABIS');

      return `
        <article class="fs-card" data-id="${item.id}">
          <div class="fs-card-top">
            <span class="fs-discount-badge">-${item.discountPercent}%</span>
            ${item.badge ? `<span class="fs-mall-badge">${item.badge}</span>` : ''}
            <div class="fs-img-wrap">
              <img src="${item.image}" alt="${item.name}" loading="lazy" class="fs-img" />
            </div>
          </div>
          <div class="fs-card-body">
            <div class="fs-price-row">
              <span class="fs-currency">Rp</span>
              <span class="fs-price">${Number(item.price).toLocaleString('id-ID')}</span>
            </div>
            <div class="fs-orig-price">Rp${Number(item.originalPrice).toLocaleString('id-ID')}</div>
            
            <div class="fs-stock-container">
              <div class="fs-progress-bar">
                <div class="fs-progress-fill ${isAlmostGone ? 'urgent' : ''}" style="width: ${soldRatio}%"></div>
              </div>
              <div class="fs-stock-label ${isAlmostGone ? 'text-urgent' : ''}">
                <span class="fire-icon">🔥</span>
                <span>${item.stockStatus}</span>
              </div>
            </div>

            <button class="fs-buy-btn" data-id="${item.id}">
              Beli Sekarang
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Bind buy button click
    this.container.querySelectorAll('.fs-buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.id;
        const item = this.items.find(i => i.id === itemId);
        if (item && window.CartManager) {
          window.CartManager.addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            badge: item.badge,
            quantity: 1
          });
          window.showToast?.(`⚡ Berhasil menambahkan "${item.name.substring(0, 24)}..." ke keranjang!`);
        }
      });
    });

    // Card click opens quick view modal
    this.container.querySelectorAll('.fs-card').forEach(card => {
      card.addEventListener('click', () => {
        const itemId = card.dataset.id;
        const item = this.items.find(i => i.id === itemId);
        if (item && window.QuickViewManager) {
          window.QuickViewManager.openModal(item);
        }
      });
    });
  }

  startCountdown() {
    // Target: Next flash sale interval (e.g., rolling 8-hour window from now or midnight)
    const now = new Date();
    const target = new Date();
    
    // Set target to next 4 hours window
    target.setHours(target.getHours() + 3);
    target.setMinutes(47);
    target.setSeconds(12);

    const updateTimer = () => {
      const current = new Date();
      let diff = Math.max(0, target - current);

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (this.timerEl.hours) this.timerEl.hours.textContent = String(hours).padStart(2, '0');
      if (this.timerEl.minutes) this.timerEl.minutes.textContent = String(minutes).padStart(2, '0');
      if (this.timerEl.seconds) this.timerEl.seconds.textContent = String(seconds).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  bindScrollEvents() {
    if (this.prevBtn && this.container) {
      this.prevBtn.addEventListener('click', () => {
        this.container.scrollBy({ left: -320, behavior: 'smooth' });
      });
    }

    if (this.nextBtn && this.container) {
      this.nextBtn.addEventListener('click', () => {
        this.container.scrollBy({ left: 320, behavior: 'smooth' });
      });
    }
  }
}
