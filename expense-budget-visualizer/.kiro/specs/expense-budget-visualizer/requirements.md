# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses, view a real-time balance, and visualize spending distribution across categories using a pie chart. The app runs entirely in the browser using HTML, CSS, and Vanilla JavaScript, with all data persisted in browser Local Storage. It includes features for sorting transactions, a dark/light mode toggle, and a monthly summary view.

## Glossary

- **App**: The Expense & Budget Visualizer web application
- **Transaction**: A single expense record consisting of a name, amount, and category
- **Category**: One of three predefined spending groups: Food, Transport, or Fun
- **Balance**: The running total of all transaction amounts (displayed as a sum)
- **Chart**: A pie chart rendered using Chart.js showing spending distribution by category
- **Local_Storage**: The browser's localStorage API used for client-side data persistence
- **Transaction_List**: The scrollable UI component displaying all added transactions
- **Input_Form**: The UI form containing the Item Name, Amount, and Category fields
- **Monthly_Summary**: An aggregated view of transactions grouped by calendar month
- **Theme**: The active color scheme of the App — either light mode or dark mode

## Requirements

### Requirement 1: Transaction Input

**User Story:** As a user, I want to add expense transactions through a form, so that I can record my spending.

#### Acceptance Criteria

1. THE Input_Form SHALL contain an Item Name field, an Amount field, and a Category selector with options Food, Transport, and Fun.
2. WHEN a user submits the Input_Form with all fields filled, THE App SHALL create a new Transaction and add it to the Transaction_List.
3. WHEN a user submits the Input_Form with one or more empty fields, THE App SHALL prevent submission and display a validation error message indicating which fields are missing.
4. WHEN a user submits the Input_Form with a non-numeric or zero-or-below value in the Amount field, THE App SHALL prevent submission and display an error message indicating the Amount must be a positive number.
5. WHEN a Transaction is successfully added, THE Input_Form SHALL clear all fields and return focus to the Item Name field.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my transactions in a scrollable list, so that I can review my recorded expenses.

#### Acceptance Criteria

1. THE Transaction_List SHALL display every stored Transaction showing its Item Name, Amount, and Category.
2. WHILE the number of transactions exceeds the visible area, THE Transaction_List SHALL be scrollable without affecting the rest of the page layout.
3. WHEN a user clicks the delete control for a Transaction, THE App SHALL remove that Transaction from the Transaction_List and from Local_Storage.
4. WHEN the Transaction_List contains no transactions, THE App SHALL display an empty-state message indicating no expenses have been recorded.

---

### Requirement 3: Total Balance

**User Story:** As a user, I want to see my total spending at a glance, so that I know how much I have spent in total.

#### Acceptance Criteria

1. THE App SHALL display the total Balance — the sum of all Transaction amounts — prominently at the top of the page.
2. WHEN a Transaction is added, THE App SHALL update the displayed Balance to include the new Transaction amount within the same user interaction.
3. WHEN a Transaction is deleted, THE App SHALL recalculate and update the displayed Balance to exclude the deleted Transaction amount within the same user interaction.
4. WHEN no Transactions exist, THE App SHALL display a Balance of 0.

---

### Requirement 4: Visual Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand how my money is distributed.

#### Acceptance Criteria

1. THE App SHALL render a pie chart using Chart.js that displays the proportion of total spending for each Category (Food, Transport, Fun).
2. WHEN a Transaction is added or deleted, THE Chart SHALL update to reflect the new spending distribution without requiring a page reload.
3. WHEN all Transactions belong to a single Category, THE Chart SHALL render a full circle representing 100% for that Category.
4. WHEN no Transactions exist, THE Chart SHALL display a placeholder or empty state indicating no data is available.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my transactions to persist between sessions, so that I do not lose my data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a Transaction is created, THE App SHALL immediately write the updated Transaction collection to Local_Storage.
2. WHEN a Transaction is deleted, THE App SHALL immediately write the updated Transaction collection to Local_Storage.
3. WHEN the App initializes, THE App SHALL read all Transactions from Local_Storage and render them in the Transaction_List, update the Balance, and update the Chart.
4. IF Local_Storage is unavailable or returns a parse error, THEN THE App SHALL initialize with an empty Transaction collection and display a non-blocking warning message to the user.

---

### Requirement 6: Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light mode, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL provide a toggle control that switches the Theme between light mode and dark mode.
2. WHEN the toggle is activated, THE App SHALL apply the new Theme to all visible UI components without a page reload.
3. WHEN a Theme is selected, THE App SHALL persist the selected Theme to Local_Storage.
4. WHEN the App initializes, THE App SHALL read the persisted Theme from Local_Storage and apply it before rendering content to prevent a flash of incorrect Theme.

---

### Requirement 7: Transaction Sorting

**User Story:** As a user, I want to sort my transactions by amount or category, so that I can quickly find or analyze my expenses.

#### Acceptance Criteria

1. THE App SHALL provide a sort control with options to sort the Transaction_List by Amount (ascending and descending) and by Category (alphabetical).
2. WHEN a sort option is selected, THE App SHALL re-render the Transaction_List in the chosen order without modifying the underlying stored Transaction data.
3. WHEN new Transactions are added while a sort option is active, THE App SHALL insert or re-render the Transaction_List maintaining the active sort order.
4. WHEN the active sort is cleared or reset, THE App SHALL display Transactions in the order they were originally added.

---

### Requirement 8: Monthly Summary View

**User Story:** As a user, I want to see a summary of my expenses grouped by month, so that I can track my spending trends over time.

#### Acceptance Criteria

1. THE App SHALL provide a Monthly Summary view that groups Transactions by calendar month and year (e.g., July 2025).
2. WHEN the Monthly Summary view is active, THE App SHALL display the total spending and per-Category breakdown for each month that contains at least one Transaction.
3. WHEN a Transaction is added or deleted, THE Monthly Summary view SHALL update to reflect the current data.
4. WHEN a Transaction is created, THE App SHALL record the creation date (year and month) as part of the Transaction data.

---

### Requirement 9: File and Folder Structure

**User Story:** As a developer, I want the project to follow a defined folder structure, so that the codebase remains clean and maintainable.

#### Acceptance Criteria

1. THE App SHALL consist of exactly one HTML file at the project root, exactly one CSS file inside a `css/` directory, and exactly one JavaScript file inside a `js/` directory.
2. THE App SHALL load without a backend server — all resources SHALL be resolvable via relative file paths suitable for direct browser file access or a static file host.
