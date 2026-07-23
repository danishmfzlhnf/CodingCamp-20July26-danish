/* Expense & Budget Visualizer — app logic */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Data Shapes (JSDoc — for editor tooling and documentation only)
  // ---------------------------------------------------------------------------

  /**
   * @typedef {Object} Transaction
   * @property {string} id           - Unique identifier (crypto.randomUUID() or Date.now() fallback)
   * @property {string} name         - Item name (non-empty string)
   * @property {number} amount       - Positive number
   * @property {'Food'|'Transport'|'Fun'} category - Expense category
   * @property {string} date         - ISO 8601 date string (YYYY-MM-DD)
   */

  /**
   * @typedef {'amount-asc'|'amount-desc'|'category-asc'} SortOption
   */

  // ---------------------------------------------------------------------------
  // AppState — single source of truth
  // ---------------------------------------------------------------------------

  /**
   * @type {{
   *   transactions: Transaction[],
   *   theme: 'light'|'dark',
   *   sort: SortOption|null,
   *   view: 'main'|'monthly'
   * }}
   */
  const AppState = {
    transactions: [],   // Transaction[]
    theme: 'light',     // 'light' | 'dark'
    sort: null,         // SortOption | null  (null = insertion order)
    view: 'main'        // 'main' | 'monthly'
  };

  // ---------------------------------------------------------------------------
  // Storage constants
  // ---------------------------------------------------------------------------

  const STORAGE_KEYS = {
    TRANSACTIONS: 'ebv_transactions',
    THEME: 'ebv_theme',
    SORT: 'ebv_sort'
  };

  const VALID_SORT_OPTIONS = ['amount-asc', 'amount-desc', 'category-asc'];

  // ---------------------------------------------------------------------------
  // Storage Module
  // ---------------------------------------------------------------------------

  /**
   * Reads all three localStorage keys, parses JSON, and populates AppState.
   * Wraps all localStorage access in try/catch so private-browsing or quota
   * errors are handled gracefully.
   *
   * @returns {{ storageAvailable: boolean }} — false when localStorage is
   *   unavailable or fatally broken; callers can show a warning banner.
   */
  function loadState() {
    let storageAvailable = true;

    try {
      // --- transactions ---
      const rawTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      let transactions = [];
      if (rawTransactions !== null) {
        try {
          const parsed = JSON.parse(rawTransactions);
          transactions = Array.isArray(parsed) ? parsed : [];
        } catch (_e) {
          transactions = [];
          storageAvailable = false;
        }
      }

      // --- theme ---
      const rawTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      const theme = (rawTheme === 'light' || rawTheme === 'dark') ? rawTheme : 'light';

      // --- sort ---
      const rawSort = localStorage.getItem(STORAGE_KEYS.SORT);
      let sort = null;
      if (rawSort !== null) {
        try {
          const parsedSort = JSON.parse(rawSort);
          sort = VALID_SORT_OPTIONS.includes(parsedSort) ? parsedSort : null;
        } catch (_e) {
          sort = null;
        }
      }

      // Mutate AppState fields — do not replace the AppState object itself
      AppState.transactions = transactions;
      AppState.theme = theme;
      AppState.sort = sort;
      // view always resets to 'main' on load
      AppState.view = 'main';

    } catch (_e) {
      // localStorage entirely unavailable (e.g. SecurityError in private browsing)
      AppState.transactions = [];
      AppState.theme = 'light';
      AppState.sort = null;
      AppState.view = 'main';
      storageAvailable = false;
    }

    return { storageAvailable };
  }

  /**
   * Serializes the transactions array and writes it to localStorage.
   * Silently catches write errors (e.g. quota exceeded).
   *
   * @param {Transaction[]} transactions
   */
  function saveTransactions(transactions) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (_e) {
      // Storage unavailable or quota exceeded — state lives in memory only
    }
  }

  /**
   * Writes the active theme preference to localStorage.
   *
   * @param {'light'|'dark'} theme
   */
  function saveTheme(theme) {
    try {
      // Store as a plain string (not JSON-encoded) so loadState() can compare
      // it directly with === 'light' / === 'dark' without a JSON.parse step.
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (_e) {
      // Storage unavailable — theme lives in memory only
    }
  }

  /**
   * Writes the active sort option (or null) to localStorage.
   *
   * @param {SortOption|null} sort
   */
  function saveSort(sort) {
    try {
      localStorage.setItem(STORAGE_KEYS.SORT, JSON.stringify(sort));
    } catch (_e) {
      // Storage unavailable — sort lives in memory only
    }
  }

  // ---------------------------------------------------------------------------
  // Validation Module
  // ---------------------------------------------------------------------------

  /**
   * Validates the add-transaction form inputs.
   *
   * Rules:
   *  - name    : must be a non-empty, non-whitespace-only string
   *  - amount  : must be a numeric value that is strictly greater than zero
   *  - category: must be a non-empty string (a category was actually selected)
   *
   * @param {string} name
   * @param {string|number} amount
   * @param {string} category
   * @returns {{ valid: boolean, errors: { name?: string, amount?: string, category?: string } }}
   */
  function validateForm(name, amount, category) {
    const errors = {};

    // Validate name
    if (typeof name !== 'string' || name.trim() === '') {
      errors.name = 'Item name is required.';
    }

    // Validate amount
    const numericAmount = Number(amount);
    if (amount === '' || amount === null || amount === undefined ||
        isNaN(numericAmount) || numericAmount <= 0) {
      errors.amount = 'Amount must be a positive number.';
    }

    // Validate category
    if (typeof category !== 'string' || category.trim() === '') {
      errors.category = 'Please select a category.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }


  // ---------------------------------------------------------------------------
  // Transaction Creation
  // ---------------------------------------------------------------------------

  /**
   * Creates a new Transaction object with a unique id and today's date.
   *
   * @param {string} name       - Item name (will be trimmed)
   * @param {string|number} amount - Expense amount (will be parsed as float)
   * @param {'Food'|'Transport'|'Fun'} category - Expense category
   * @returns {Transaction}
   */
  function createTransaction(name, amount, category) {
    const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);

    const date = new Date().toISOString().slice(0, 10);

    return {
      id,
      name: name.trim(),
      amount: parseFloat(amount),
      category,
      date
    };
  }


  // ---------------------------------------------------------------------------
  // Balance Module
  // ---------------------------------------------------------------------------

  /**
   * Calculates the total balance as the sum of all transaction amounts.
   * Returns 0 for an empty array.
   * @param {Transaction[]} transactions
   * @returns {number}
   */
  function calculateBalance(transactions) {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Formats a number as a USD currency string.
   * @param {number} amount
   * @returns {string}
   */
  function formatCurrency(amount) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  /**
   * Reads AppState.transactions, calculates the balance, and updates the DOM.
   */
  function renderBalance() {
    const el = document.getElementById('balance-display');
    if (!el) return;
    const total = calculateBalance(AppState.transactions);
    el.textContent = formatCurrency(total);
  }

  // ---------------------------------------------------------------------------
  // Chart Module
  // ---------------------------------------------------------------------------

  /**
   * Computes per-category totals from a transactions array.
   * @param {Transaction[]} transactions
   * @returns {{ Food: number, Transport: number, Fun: number }}
   */
  function computeCategoryTotals(transactions) {
    return transactions.reduce(
      (totals, t) => {
        if (totals[t.category] !== undefined) {
          totals[t.category] += t.amount;
        }
        return totals;
      },
      { Food: 0, Transport: 0, Fun: 0 }
    );
  }

  /** @type {Chart|null} */
  let chartInstance = null;

  /**
   * Initialises a Chart.js Pie chart on the given canvas context.
   * If Chart.js is not available, shows the #chart-fallback element instead.
   * @param {CanvasRenderingContext2D} ctx
   */
  function initChart(ctx) {
    if (typeof Chart === 'undefined') {
      const fallback = document.getElementById('chart-fallback');
      if (fallback) fallback.hidden = false;
      return;
    }

    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Food', 'Transport', 'Fun'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#f97316', '#3b82f6', '#a855f7']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  /**
   * Updates the chart with the latest category totals from AppState.
   * Falls back to a text list in #chart-fallback-list when Chart.js is absent.
   */
  function renderChart() {
    const totals = computeCategoryTotals(AppState.transactions);
    const data = [totals.Food, totals.Transport, totals.Fun];
    const hasData = data.some(v => v > 0);

    if (typeof Chart === 'undefined') {
      // Fallback: render text totals in #chart-fallback-list
      const fallbackList = document.getElementById('chart-fallback-list');
      if (fallbackList) {
        fallbackList.innerHTML = ['Food', 'Transport', 'Fun'].map(
          (cat, i) => `<li>${cat}: ${formatCurrency(data[i])}</li>`
        ).join('');
      }
      return;
    }

    if (!chartInstance) return;
    chartInstance.data.datasets[0].data = hasData ? data : [0, 0, 0];
    chartInstance.update();
  }

  // ---------------------------------------------------------------------------
  // Render Module
  // ---------------------------------------------------------------------------

  /**
   * Escapes HTML special characters to prevent XSS.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Renders the sorted transaction list into #transaction-list.
   * Shows/hides the empty state message.
   */
  function renderTransactionList() {
    const listEl = document.getElementById('transaction-list');
    const emptyEl = document.getElementById('empty-state');
    if (!listEl) return;

    const sorted = sortTransactions(AppState.transactions, AppState.sort);

    if (sorted.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    listEl.innerHTML = sorted.map(t => `
    <li class="transaction-item" data-id="${t.id}">
      <span class="transaction-name">${escapeHtml(t.name)}</span>
      <span class="transaction-amount">${formatCurrency(t.amount)}</span>
      <span class="transaction-category category-${t.category.toLowerCase()}">${t.category}</span>
      <button class="btn-delete" data-id="${t.id}" aria-label="Delete ${escapeHtml(t.name)}">✕</button>
    </li>
  `).join('');
  }

  /**
   * Removes a transaction by id, persists, and re-renders.
   * @param {string} id
   */
  function deleteTransaction(id) {
    AppState.transactions = AppState.transactions.filter(t => t.id !== id);
    saveTransactions(AppState.transactions);
    renderAll();
  }

  // ---------------------------------------------------------------------------
  // Sorting Module
  // ---------------------------------------------------------------------------

  /**
   * Returns a new sorted array based on sortOption.
   * Does NOT mutate the input array.
   * @param {Transaction[]} transactions
   * @param {SortOption|null} sortOption
   * @returns {Transaction[]}
   */
  function sortTransactions(transactions, sortOption) {
    if (!sortOption) return [...transactions];
    const copy = [...transactions];
    if (sortOption === 'amount-asc') {
      return copy.sort((a, b) => a.amount - b.amount);
    }
    if (sortOption === 'amount-desc') {
      return copy.sort((a, b) => b.amount - a.amount);
    }
    if (sortOption === 'category-asc') {
      return copy.sort((a, b) => a.category.localeCompare(b.category));
    }
    return copy;
  }

  // ---------------------------------------------------------------------------
  // Theme Module
  // ---------------------------------------------------------------------------

  /**
   * Applies a theme to the document and persists it.
   * Sets data-theme attribute on <html> element.
   * @param {'light'|'dark'} theme
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    AppState.theme = theme;
    saveTheme(theme);
    // Update toggle button label
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
      toggleBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  }

  /**
   * Flips the current theme and applies it.
   */
  function toggleTheme() {
    applyTheme(AppState.theme === 'dark' ? 'light' : 'dark');
  }

  // ---------------------------------------------------------------------------
  // Monthly Summary Module
  // ---------------------------------------------------------------------------

  /**
   * Groups transactions by calendar month (YYYY-MM).
   * Returns groups sorted by yearMonth descending (most recent first).
   * @param {Transaction[]} transactions
   * @returns {Array<{label:string, yearMonth:string, transactions:Transaction[], total:number, categoryTotals:{Food:number,Transport:number,Fun:number}}>}
   */
  function groupByMonth(transactions) {
    const map = {};

    transactions.forEach(t => {
      const yearMonth = t.date.slice(0, 7); // "YYYY-MM"
      if (!map[yearMonth]) {
        map[yearMonth] = [];
      }
      map[yearMonth].push(t);
    });

    return Object.keys(map)
      .sort((a, b) => b.localeCompare(a)) // descending
      .map(yearMonth => {
        const group = map[yearMonth];
        const total = group.reduce((s, t) => s + t.amount, 0);
        const categoryTotals = group.reduce(
          (ct, t) => {
            if (ct[t.category] !== undefined) ct[t.category] += t.amount;
            return ct;
          },
          { Food: 0, Transport: 0, Fun: 0 }
        );
        // Build human-readable label e.g. "July 2025"
        const [year, month] = yearMonth.split('-');
        const label = new Date(Number(year), Number(month) - 1, 1)
          .toLocaleString('en-US', { month: 'long', year: 'numeric' });
        return { label, yearMonth, transactions: group, total, categoryTotals };
      });
  }

  /**
   * Renders the monthly summary section.
   * Hidden when AppState.view !== 'monthly'.
   */
  function renderMonthlySummary() {
    const section = document.getElementById('monthly-summary');
    const listEl = document.getElementById('monthly-summary-list');
    if (!section || !listEl) return;

    if (AppState.view !== 'monthly') {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    const groups = groupByMonth(AppState.transactions);

    if (groups.length === 0) {
      listEl.innerHTML = '<p class="empty-state">No expenses recorded yet.</p>';
      return;
    }

    listEl.innerHTML = groups.map(g => `
      <div class="month-card">
        <h3 class="month-title">${escapeHtml(g.label)}</h3>
        <p class="month-total">Total: <strong>${formatCurrency(g.total)}</strong></p>
        <ul class="month-category-list">
          <li><span class="category-dot category-food"></span> Food: ${formatCurrency(g.categoryTotals.Food)}</li>
          <li><span class="category-dot category-transport"></span> Transport: ${formatCurrency(g.categoryTotals.Transport)}</li>
          <li><span class="category-dot category-fun"></span> Fun: ${formatCurrency(g.categoryTotals.Fun)}</li>
        </ul>
      </div>
    `).join('');
  }

  // ---------------------------------------------------------------------------
  // App Initialization & Event Wiring
  // ---------------------------------------------------------------------------

  /**
   * Re-renders all UI components from AppState.
   */
  function renderAll() {
    renderBalance();
    renderTransactionList();
    renderChart();
    if (AppState.view === 'monthly') {
      renderMonthlySummary();
    }
  }

  /**
   * Initialises the app: loads state, applies theme, inits chart, renders.
   */
  function init() {
    const { storageAvailable } = loadState();

    // Show warning banner if storage is unavailable
    if (!storageAvailable) {
      const warningEl = document.getElementById('storage-warning');
      if (warningEl) warningEl.hidden = false;
    }

    // Apply persisted theme before rendering (prevents flash)
    applyTheme(AppState.theme);

    // Restore sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect && AppState.sort) {
      sortSelect.value = AppState.sort;
    }

    // Init chart
    const canvas = document.getElementById('spending-chart');
    if (canvas) {
      initChart(canvas.getContext('2d'));
    }

    renderAll();

    // --- Form submit event ---
    const form = document.getElementById('transaction-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const nameInput = document.getElementById('item-name');
        const amountInput = document.getElementById('amount');
        const categoryInput = document.getElementById('category');

        const name = nameInput ? nameInput.value : '';
        const amount = amountInput ? amountInput.value : '';
        const category = categoryInput ? categoryInput.value : '';

        const { valid, errors } = validateForm(name, amount, category);

        // Clear previous errors
        const nameError = document.getElementById('name-error');
        const amountError = document.getElementById('amount-error');
        const categoryError = document.getElementById('category-error');
        if (nameError) nameError.textContent = '';
        if (amountError) amountError.textContent = '';
        if (categoryError) categoryError.textContent = '';

        if (!valid) {
          if (errors.name && nameError) nameError.textContent = errors.name;
          if (errors.amount && amountError) amountError.textContent = errors.amount;
          if (errors.category && categoryError) categoryError.textContent = errors.category;
          return;
        }

        const transaction = createTransaction(name, amount, category);
        AppState.transactions.push(transaction);
        saveTransactions(AppState.transactions);
        renderAll();

        // Clear form and return focus
        form.reset();
        if (nameInput) nameInput.focus();
      });
    }

    // --- Delete event (event delegation) ---
    const transactionList = document.getElementById('transaction-list');
    if (transactionList) {
      transactionList.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-delete');
        if (btn) {
          const id = btn.dataset.id;
          if (id) deleteTransaction(id);
        }
      });
    }

    // --- Sort control change event ---
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        AppState.sort = this.value || null;
        saveSort(AppState.sort);
        renderTransactionList();
      });
    }

    // --- Theme toggle click event ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // --- View toggle click event ---
    const viewToggle = document.getElementById('view-toggle');
    if (viewToggle) {
      viewToggle.addEventListener('click', function () {
        AppState.view = AppState.view === 'monthly' ? 'main' : 'monthly';
        this.textContent = AppState.view === 'monthly' ? '📊 Main View' : '📅 Monthly View';
        this.setAttribute('aria-pressed', AppState.view === 'monthly' ? 'true' : 'false');

        // Show/hide the main content grid vs monthly summary
        const contentGrid = document.querySelector('.content-grid');
        const monthlySummary = document.getElementById('monthly-summary');
        if (contentGrid) contentGrid.hidden = AppState.view === 'monthly';
        renderMonthlySummary();
      });
    }
  }

  // Kick off the app once DOM is ready
  document.addEventListener('DOMContentLoaded', init);

})();
