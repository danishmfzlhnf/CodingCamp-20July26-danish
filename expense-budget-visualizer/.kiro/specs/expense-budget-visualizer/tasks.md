# Implementation Plan: Expense & Budget Visualizer

## Overview

The implementation uses HTML, CSS, and Vanilla JavaScript — no build tools, no frameworks. The single `js/app.js` file is organized with clearly separated logical sections: state, storage, validation, rendering, chart management, and event wiring. A CDN-hosted Chart.js handles the pie chart. All tasks build incrementally toward a fully wired, working single-page app.

## Tasks

- [x] 1. Create project folder structure and static HTML shell
  - Create `index.html` at the project root with semantic HTML: header (balance display, theme toggle), main section (input form, transaction list, chart canvas), and a monthly summary section
  - Create empty `css/style.css` and empty `js/app.js` files
  - Link `css/style.css` in the `<head>` and `js/app.js` before `</body>` using relative paths
  - Include Chart.js via CDN `<script>` tag before `app.js`
  - Add the sort control (select element) and view-toggle button to the HTML
  - _Requirements: 9.1, 9.2_

- [x] 2. Implement core data model and storage module
  - [x] 2.1 Define the `AppState` object and `Transaction` shape inside `app.js`
    - Define `AppState` with `transactions`, `theme`, `sort`, and `view` fields
    - Document the `Transaction` shape (id, name, amount, category, date)
    - _Requirements: 5.1, 5.2, 5.3, 8.4_

  - [x] 2.2 Implement `loadState()`, `saveTransactions()`, `saveTheme()`, and `saveSort()` functions
    - `loadState()` reads all three `localStorage` keys (`ebv_transactions`, `ebv_theme`, `ebv_sort`), parses JSON, and returns a fully-populated `AppState`; wraps all `localStorage` access in try/catch
    - `saveTransactions()` serializes and writes the transactions array
    - `saveTheme()` and `saveSort()` write their respective values
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.3_

  - [ ]* 2.3 Write property test: Storage round-trip preserves transactions
    - **Property 8: Storage round-trip preserves transactions**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - `// Feature: expense-budget-visualizer, Property 8: For any collection of transactions written to localStorage, reading and deserializing that data should produce a collection equal to the original`
    - Use fast-check to generate random transaction arrays; write then read; assert deep equality

- [x] 3. Implement validation and transaction creation logic
  - [x] 3.1 Implement `validateForm(name, amount, category)` returning `{ valid, errors }`
    - Reject empty or whitespace-only name
    - Reject non-numeric, zero, and negative amounts
    - Reject missing category value
    - _Requirements: 1.3, 1.4_

  - [ ]* 3.2 Write property test: Invalid form input is rejected
    - **Property 2: Invalid form input is rejected**
    - **Validates: Requirements 1.3, 1.4**
    - `// Feature: expense-budget-visualizer, Property 2: For any submission where at least one required field is empty/whitespace or amount is invalid, the result should be invalid`
    - Use fast-check to generate combos with at least one invalid field; assert `valid === false`

  - [x] 3.3 Implement `createTransaction(name, amount, category)` function
    - Generate a unique `id` using `crypto.randomUUID()` with fallback
    - Set `date` to today's ISO date string (`YYYY-MM-DD`)
    - Return a `Transaction` object
    - _Requirements: 1.2, 8.4_

  - [ ]* 3.4 Write property test: Valid transaction addition grows list
    - **Property 1: Valid transaction addition grows list**
    - **Validates: Requirements 1.2**
    - `// Feature: expense-budget-visualizer, Property 1: For any valid (name, amount, category), adding it should increase transaction list length by exactly 1`
    - Use fast-check to generate valid inputs; call `createTransaction` and push to array; assert length grows by 1

- [x] 4. Checkpoint — Ensure storage and validation logic is solid
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement balance calculation and rendering
  - [x] 5.1 Implement `calculateBalance(transactions)` pure function
    - Returns the sum of all `amount` fields; returns 0 for empty array
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 5.2 Implement `renderBalance()` function
    - Calls `calculateBalance(AppState.transactions)` and updates the balance DOM element
    - _Requirements: 3.1_

  - [ ]* 5.3 Write property test: Balance equals sum of all amounts
    - **Property 6: Balance equals sum of all amounts**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - `// Feature: expense-budget-visualizer, Property 6: For any collection of transactions, calculateBalance should equal the arithmetic sum of all amounts`
    - Use fast-check to generate random transaction arrays; assert `calculateBalance(arr) === arr.reduce((s, t) => s + t.amount, 0)`

- [x] 6. Implement category totals and Chart.js integration
  - [x] 6.1 Implement `computeCategoryTotals(transactions)` pure function
    - Returns `{ Food, Transport, Fun }` with amounts summed per category; defaults to 0 for missing categories
    - _Requirements: 4.1, 4.3_

  - [ ]* 6.2 Write property test: Chart data category totals match transaction sums
    - **Property 7: Chart data category totals match transaction sums**
    - **Validates: Requirements 4.1, 4.3**
    - `// Feature: expense-budget-visualizer, Property 7: For any set of transactions, computeCategoryTotals should produce category sums matching manual reduce per category`
    - Use fast-check; generate random arrays with random categories; assert each category total equals filtered sum

  - [x] 6.3 Implement `initChart(ctx)` to create a Chart.js Pie instance
    - Create chart with labels `['Food', 'Transport', 'Fun']`, initial data `[0, 0, 0]`, distinct colors per category
    - Store chart instance in a module-level variable
    - Guard against `typeof Chart === 'undefined'`; show text fallback if Chart.js is unavailable
    - _Requirements: 4.1, 4.4_

  - [x] 6.4 Implement `renderChart()` function
    - Calls `computeCategoryTotals(AppState.transactions)` and calls `updateChart(totals)`
    - Handles empty-state display when all totals are 0
    - _Requirements: 4.2, 4.4_

- [x] 7. Implement transaction list rendering and deletion
  - [x] 7.1 Implement `renderTransactionList()` function
    - Reads `AppState.transactions`, applies `AppState.sort` to produce the display order
    - Creates list item elements showing name, amount (formatted as currency), and category badge
    - Attaches a delete button to each item with the transaction id in a data attribute
    - Displays empty-state message when list is empty
    - _Requirements: 2.1, 2.4_

  - [ ]* 7.2 Write property test: Transaction list renders all fields
    - **Property 4: Transaction list renders all fields**
    - **Validates: Requirements 2.1**
    - `// Feature: expense-budget-visualizer, Property 4: For any collection of transactions, each transaction's name, amount, and category should appear in the rendered HTML`
    - Use fast-check; generate random transaction arrays; call `renderTransactionList()`; assert each field is present in the DOM

  - [x] 7.3 Implement `deleteTransaction(id)` function
    - Filters `AppState.transactions` to remove the matching id
    - Calls `saveTransactions()` then `renderAll()`
    - _Requirements: 2.3, 5.2_

  - [ ]* 7.4 Write property test: Delete removes transaction from list and storage
    - **Property 5: Delete removes transaction from list and storage**
    - **Validates: Requirements 2.3**
    - `// Feature: expense-budget-visualizer, Property 5: For any transaction that exists, deleting it should result in it not appearing in the rendered list or in localStorage`
    - Use fast-check; generate random transaction arrays; pick a random id; call `deleteTransaction`; assert it is gone from state and storage

- [x] 8. Implement sorting logic
  - [x] 8.1 Implement `sortTransactions(transactions, sortOption)` pure function
    - Returns a new sorted array for `'amount-asc'`, `'amount-desc'`, `'category-asc'`
    - Returns original array order for `null`
    - Does NOT mutate the input array
    - _Requirements: 7.2, 7.4_

  - [ ]* 8.2 Write property test: Sorting is a non-mutating permutation
    - **Property 10: Sorting is a non-mutating permutation**
    - **Validates: Requirements 7.2, 7.3, 7.4**
    - `// Feature: expense-budget-visualizer, Property 10: For any transactions and sort option, the sorted list contains the same items (same ids) as the original`
    - Use fast-check; generate random transactions and random sort option; assert sorted array has same ids (regardless of order), and original array is unchanged

- [x] 9. Checkpoint — Ensure core features are functional end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement theme toggle
  - [x] 10.1 Implement `applyTheme(theme)` and `toggleTheme()` functions
    - `applyTheme` sets a `data-theme` attribute on `<body>` (or `<html>`) and calls `saveTheme()`
    - `toggleTheme` flips between `'light'` and `'dark'` and calls `applyTheme()`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 10.2 Write property test: Theme toggle produces opposite theme
    - **Property 9: Theme toggle produces opposite theme**
    - **Validates: Requirements 6.2, 6.3, 6.4**
    - `// Feature: expense-budget-visualizer, Property 9: For any current theme value, calling toggleTheme should result in the opposite theme being applied to the DOM and saved to localStorage`
    - Use fast-check with the two theme values; assert toggling always inverts the theme

- [x] 11. Implement Monthly Summary view
  - [x] 11.1 Implement `groupByMonth(transactions)` pure function
    - Groups transactions by `YYYY-MM` derived from `date` field
    - Returns an array of `MonthlyGroup` objects sorted by `yearMonth` descending (most recent first)
    - Each group has `label`, `yearMonth`, `transactions`, `total`, and `categoryTotals`
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ]* 11.2 Write property test: Monthly grouping assigns transactions to correct month
    - **Property 11: Monthly grouping assigns transactions to correct month**
    - **Validates: Requirements 8.1, 8.2, 8.4**
    - `// Feature: expense-budget-visualizer, Property 11: For any set of transactions, each transaction should appear in exactly one monthly group matching its date's year-month, with group total equaling sum of its transaction amounts`
    - Use fast-check; generate random transactions with random dates; call `groupByMonth`; assert each transaction is in the right group; assert group totals are correct

  - [x] 11.3 Implement `renderMonthlySummary()` function
    - Calls `groupByMonth(AppState.transactions)` and renders a summary card per month
    - Shows month label, total, and per-category breakdown
    - Hides when `AppState.view !== 'monthly'`
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 12. Implement app initialization and event wiring
  - [x] 12.1 Implement `init()` function
    - Calls `loadState()` and populates `AppState`
    - Handles localStorage parse errors: catches exception, initializes empty state, displays warning banner
    - Applies persisted theme via `applyTheme(AppState.theme)`
    - Calls `initChart()` then `renderAll()`
    - _Requirements: 5.3, 5.4, 6.4_

  - [x] 12.2 Wire the input form submit event
    - Prevent default form submission
    - Read form values, call `validateForm()`, display inline errors if invalid
    - On valid: call `createTransaction()`, push to `AppState.transactions`, call `saveTransactions()`, call `renderAll()`, clear form fields, return focus to Item Name
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 12.3 Write property test: Input form clears after successful add
    - **Property 3: Input form clears after successful add**
    - **Validates: Requirements 1.5**
    - `// Feature: expense-budget-visualizer, Property 3: For any valid transaction submission, the form fields should be empty/default after the add`
    - Use fast-check; generate random valid inputs; simulate form submit; assert fields are cleared

  - [x] 12.4 Wire the delete button event (event delegation on the list container)
    - Listen for clicks on the list container, identify delete button clicks by data attribute
    - Call `deleteTransaction(id)` with the extracted id
    - _Requirements: 2.3_

  - [x] 12.5 Wire the sort control `change` event
    - Update `AppState.sort` with the selected value
    - Call `saveSort()` and `renderTransactionList()`
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 12.6 Wire the theme toggle button `click` event
    - Call `toggleTheme()`
    - _Requirements: 6.1, 6.2_

  - [x] 12.7 Wire the view-toggle button `click` event
    - Toggle `AppState.view` between `'main'` and `'monthly'`
    - Show/hide the appropriate sections; call `renderMonthlySummary()` when switching to monthly view
    - _Requirements: 8.1, 8.3_

  - [x] 12.8 Implement `renderAll()` to call `renderBalance()`, `renderTransactionList()`, `renderChart()`, and `renderMonthlySummary()` (when monthly view is active)
    - _Requirements: 3.2, 3.3, 4.2, 8.3_

- [x] 13. Apply CSS styling
  - [x] 13.1 Write base styles, layout, and typography in `css/style.css`
    - Use CSS custom properties (variables) for colors so light/dark mode only requires changing a few values
    - Define `[data-theme="dark"]` overrides for all color variables
    - Layout: centered container, fixed header with balance, sidebar or two-column layout for form + list on wider viewports
    - _Requirements: NFR-2, NFR-3_

  - [x] 13.2 Style the transaction list items with category color badges
    - Food: one accent color, Transport: another, Fun: a third
    - Scrollable list container with fixed max-height and `overflow-y: auto`
    - _Requirements: 2.1, 2.2_

  - [x] 13.3 Style the sort control, theme toggle, and view-switch button
    - Clear visual affordance for interactive controls
    - Active sort option visually indicated
    - _Requirements: 6.1, 7.1_

  - [x] 13.4 Style the chart container and monthly summary cards
    - Chart displayed in a clearly bounded section
    - Monthly summary uses card-style layout per month with readable totals
    - _Requirements: 4.1, 8.1_

- [x] 14. Final checkpoint — Ensure all features work end-to-end
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: add transaction → list updates, balance updates, chart updates
  - Verify: delete transaction → list updates, balance updates, chart updates
  - Verify: page refresh → transactions persist, theme persists
  - Verify: dark/light toggle works
  - Verify: sort changes list order without changing stored data
  - Verify: monthly summary view renders correct groupings and totals

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build
- Each property test requires fast-check loaded via CDN in a separate `test.html` file — this file is NOT part of the production build
- All property tests reference a specific design property number and requirements clause for traceability
- The `renderAll()` function is the single re-render entry point — always call it after any state mutation
- `sortTransactions()` must never mutate `AppState.transactions`; always work on a shallow copy
- Use `parseFloat()` (not `parseInt`) for amount parsing to handle decimal values
