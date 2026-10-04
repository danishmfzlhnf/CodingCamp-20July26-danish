/**
 * Voucher Wallet: Claimable vouchers with interactive state and localStorage persistence
 */

class VoucherManager {
  constructor(sectionId, vouchers) {
    this.section = document.getElementById(sectionId);
    if (!this.section) return;

    this.vouchers = vouchers || [];
    this.storageKey = 'shopee_claimed_vouchers';
    this.claimedVouchers = new Set(this.loadClaimed());
    this.container = this.section.querySelector('.vouchers-grid');
    this.badgeCounter = document.getElementById('user-voucher-count');

    this.init();
  }

  loadClaimed() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveClaimed() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify([...this.claimedVouchers]));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
    this.updateBadge();
  }

  updateBadge() {
    if (this.badgeCounter) {
      this.badgeCounter.textContent = `${this.claimedVouchers.size} Voucher`;
    }
  }

  init() {
    this.render();
    this.updateBadge();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = this.vouchers.map(v => {
      const isClaimed = this.claimedVouchers.has(v.id);
      return `
        <div class="voucher-card ${isClaimed ? 'claimed' : ''}" data-id="${v.id}">
          <div class="voucher-left" style="background: ${v.badgeColor}">
            <div class="v-notch top"></div>
            <div class="v-badge-text">${v.badge}</div>
            <div class="v-code-tag">${v.code}</div>
            <div class="v-notch bottom"></div>
          </div>
          <div class="voucher-middle">
            <div class="v-title">${v.title}</div>
            <div class="v-meta">
              <span class="v-spend">${v.minSpendLabel}</span> &bull; 
              <span class="v-category">${v.category}</span>
            </div>
            <div class="v-expiry">⏰ ${v.expiry}</div>
          </div>
          <div class="voucher-right">
            <button class="v-claim-btn ${isClaimed ? 'claimed' : ''}" data-id="${v.id}">
              ${isClaimed ? '✓ Terklaim' : 'Klaim'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('.v-claim-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const voucher = this.vouchers.find(v => v.id === id);

        if (!this.claimedVouchers.has(id)) {
          this.claimedVouchers.add(id);
          this.saveClaimed();
          btn.classList.add('claimed');
          btn.innerHTML = '✓ Terklaim';
          btn.closest('.voucher-card').classList.add('claimed');
          
          window.showToast?.(`🎟️ Berhasil klaim voucher "${voucher?.badge || 'Voucher'}"! Siap digunakan saat checkout.`);
        } else {
          window.showToast?.(`ℹ️ Voucher "${voucher?.badge || 'Voucher'}" sudah ada di dompet voucher Anda.`);
        }
      });
    });
  }
}
