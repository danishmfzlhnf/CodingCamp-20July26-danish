/**
 * Smart Search Bar: Auto-suggest, Recent Search History, Trending Keywords
 */

class SmartSearchManager {
  constructor(inputSelector, dropdownSelector, products) {
    this.input = document.querySelector(inputSelector);
    this.dropdown = document.querySelector(dropdownSelector);
    this.searchBtn = document.querySelector('.search-submit-btn');
    this.products = products || [];
    this.storageKey = 'shopee_search_history';
    this.history = this.loadHistory();
    this.trendingKeywords = [
      "iPhone 15 Pro",
      "Sepatu Sneakers Pria",
      "Sunscreen SPF 50",
      "TWS Bluetooth Earphone",
      "Kaos Oversized Katun",
      "Tumbler Stainless 1L",
      "Smartwatch AMOLED",
      "Kopi Arabika Gayo"
    ];

    this.debounceTimer = null;
    this.init();
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : ["Earphone Bluetooth", "Sepatu Pria", "Sunscreen"];
    } catch (e) {
      return ["Earphone Bluetooth", "Sepatu Pria"];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  }

  addHistory(query) {
    const trimmed = query.trim();
    if (!trimmed) return;
    this.history = [trimmed, ...this.history.filter(h => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    this.saveHistory();
  }

  removeHistory(item) {
    this.history = this.history.filter(h => h !== item);
    this.saveHistory();
    this.renderDefaultDropdown();
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.renderDefaultDropdown();
  }

  init() {
    if (!this.input || !this.dropdown) return;

    this.input.addEventListener('focus', () => {
      if (!this.input.value.trim()) {
        this.renderDefaultDropdown();
      } else {
        this.handleAutoSuggest(this.input.value);
      }
      this.dropdown.classList.add('visible');
    });

    this.input.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      const val = e.target.value.trim();
      if (!val) {
        this.renderDefaultDropdown();
        this.dropdown.classList.add('visible');
        return;
      }
      this.debounceTimer = setTimeout(() => {
        this.handleAutoSuggest(val);
      }, 150);
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.executeSearch(this.input.value);
      } else if (e.key === 'Escape') {
        this.dropdown.classList.remove('visible');
      }
    });

    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.executeSearch(this.input.value);
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.dropdown.classList.remove('visible');
      }
    });
  }

  renderDefaultDropdown() {
    let html = '';

    // History section
    if (this.history.length > 0) {
      html += `
        <div class="search-section history-section">
          <div class="search-section-header">
            <span class="sec-title">🕒 Riwayat Pencarian</span>
            <button type="button" class="btn-clear-history" id="btn-clear-history">Hapus Semua</button>
          </div>
          <div class="search-history-chips">
            ${this.history.map(item => `
              <div class="history-chip" data-query="${item}">
                <span class="chip-text">${item}</span>
                <span class="chip-remove" data-remove="${item}" title="Hapus">&times;</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Trending section
    html += `
      <div class="search-section trending-section">
        <div class="search-section-header">
          <span class="sec-title">🔥 Pencarian Populer</span>
        </div>
        <ul class="trending-list">
          ${this.trendingKeywords.map((kw, i) => `
            <li class="trending-item" data-query="${kw}">
              <span class="trend-rank ${i < 3 ? 'top' : ''}">${i + 1}</span>
              <span class="trend-text">${kw}</span>
              <span class="trend-tag">${i < 2 ? 'HOT' : 'PROMO'}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    this.dropdown.innerHTML = html;
    this.bindDropdownEvents();
  }

  handleAutoSuggest(query) {
    const q = query.toLowerCase();
    const matches = this.products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    ).slice(0, 6);

    if (matches.length === 0) {
      this.dropdown.innerHTML = `
        <div class="search-no-result">
          <p>Tidak ada produk untuk "<strong>${query}</strong>"</p>
          <p class="sub-hint">Coba kata kunci lain atau lihat pencarian populer di bawah:</p>
          <div class="search-history-chips">
            ${this.trendingKeywords.slice(0, 4).map(kw => `
              <div class="history-chip" data-query="${kw}">
                <span class="chip-text">${kw}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      this.bindDropdownEvents();
      return;
    }

    let html = `
      <div class="search-suggest-list">
        <div class="suggest-header">Hasil Rekomendasi untuk "${query}"</div>
        ${matches.map(p => `
          <div class="suggest-item" data-id="${p.id}" data-query="${p.name}">
            <img src="${p.image}" alt="${p.name}" class="suggest-thumb" />
            <div class="suggest-info">
              <div class="suggest-name">${this.highlightMatch(p.name, query)}</div>
              <div class="suggest-price">${formatRupiah(p.price)}</div>
            </div>
            <span class="suggest-arrow">&rarr;</span>
          </div>
        `).join('')}
      </div>
    `;

    this.dropdown.innerHTML = html;
    this.bindDropdownEvents();
  }

  highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
  }

  bindDropdownEvents() {
    // History chip clicks
    this.dropdown.querySelectorAll('.history-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.classList.contains('chip-remove')) {
          e.stopPropagation();
          const toRemove = e.target.dataset.remove;
          this.removeHistory(toRemove);
        } else {
          const query = chip.dataset.query;
          this.input.value = query;
          this.executeSearch(query);
        }
      });
    });

    // Clear all history
    const clearBtn = this.dropdown.querySelector('#btn-clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearHistory();
      });
    }

    // Trending item clicks
    this.dropdown.querySelectorAll('.trending-item').forEach(item => {
      item.addEventListener('click', () => {
        const query = item.dataset.query;
        this.input.value = query;
        this.executeSearch(query);
      });
    });

    // Suggest item clicks
    this.dropdown.querySelectorAll('.suggest-item').forEach(item => {
      item.addEventListener('click', () => {
        const prodId = item.dataset.id;
        const prod = this.products.find(p => p.id === prodId);
        if (prod && window.QuickViewManager) {
          this.addHistory(prod.name);
          this.dropdown.classList.remove('visible');
          window.QuickViewManager.openModal(prod);
        } else {
          this.executeSearch(item.dataset.query);
        }
      });
    });
  }

  executeSearch(query) {
    const trimmed = query.trim();
    if (!trimmed) return;

    this.addHistory(trimmed);
    this.dropdown.classList.remove('visible');

    // Filter recommendation section if present
    if (window.InfiniteScrollManager) {
      window.InfiniteScrollManager.applySearchFilter(trimmed);
    }

    window.showToast?.(`🔍 Mencari produk: "${trimmed}"`);

    // Smooth scroll down to recommendation section
    const recSection = document.getElementById('recommendations');
    if (recSection) {
      recSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
