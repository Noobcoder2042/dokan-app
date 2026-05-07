# Dokan Pro - Full Project Guide (Layman Friendly)

This document explains the full codebase in simple language.
If you are not a developer, you can still understand what this app does and where each feature lives.

---

## 1. What this app is

Dokan Pro is a shop billing app with:
- Fast bill making
- Customer memory (autofill)
- Inventory management
- Sales dashboard + analysis
- Thermal printing
- Backup/import/delete tools

The app is built using:
- React (frontend UI)
- Firebase Auth (login)
- Firestore (data storage)
- jsPDF (PDF files)
- JSZip (ZIP backup files)

---

## 2. How the app is organized

Top-level folders:

- `src/`
  - Main code
- `src/component/`
  - Screens and UI parts
- `src/context/`
  - Global app state (logged user, active shop)
- `src/services/`
  - Firestore read/write logic
- `public/branding/`
  - Logos and images

Main entry flow:

1. `src/main.jsx`
   - Starts React app.
2. `src/App.jsx`
   - Loads theme, checks login.
   - Handles routes (Billing, Dashboard, Inventory, Analysis, Settings).
3. `src/component/Navbar.jsx`
   - Top navigation.

---

## 3. Authentication and shop access

### `src/context/AuthContext.jsx`
Handles:
- Login state
- User profile
- Logout

### `src/context/ShopContext.jsx`
Handles:
- Which shop is active
- Reading shop settings
- Shop bootstrap and permission recovery

Important behavior:
- If a shop access fails due to permission, code auto-recovers and switches to a safe shop ID.
- This prevents app crash loops.

---

## 4. Billing screen (core business workflow)

### Main file: `src/component/Calculator.jsx`

This is your most important screen.

What it does:
- Takes customer name/phone/address
- Adds items line by line
- Calculates subtotal + extra charges + grand total
- Saves bill to Firestore
- Updates stock from inventory
- Generates PDF
- Thermal print
- Save draft bills in localStorage

### Billing logic in simple terms

1. User types/selects item
2. If item exists in inventory:
   - Price autofills
   - Unit autofills (`piece`/`dozen`)
3. User enters quantity
4. App calculates line total
5. User verifies each line item (checkbox)
6. App allows print/PDF only when all lines are verified

### Keyboard shortcuts

- `Enter`:
  - Moves to next field / adds item (normal flow)
- `Ctrl + Enter`:
  - Adds more of same item (keeps item name)
- `Ctrl + Right Arrow`:
  - Toggles unit (`piece` <-> `dozen`)

### Item-name memory feature

Even if bills are deleted, item names can still be suggested because:
- Local item history is stored in browser localStorage per shop/user
- Key is like: `item-history-{shopId}-{uid}`

---

## 5. Thermal print template

### `src/component/calculator/thermalPrint.js`

This file builds the thermal HTML string.

Current behavior:
- Uses 80mm style
- Prints:
  - Date
  - Time
  - Customer lines
  - Item rows
  - Totals

Unit display:
- `Ps` = piece
- `Dz` = dozen

Grand total:
- Rounded amount

---

## 6. Dashboard and bill history

### `src/component/Dashboard.jsx`

Shows:
- Bills table
- Customer info table
- Date filters (today / last N days / custom)
- Download/print date range bills
- Show/hide summary state (saved in localStorage)

### `src/component/BillsTable.jsx`

Shows bill list rows with actions:
- Preview
- Edit
- Delete

### `src/component/BillDialog.jsx`

Bill preview popup:
- Full line items
- Extra charges
- Total
- Download PDF
- Print previous bill

---

## 7. Analysis tab

### `src/component/Analysis.jsx`

This is reporting view:
- Date filter
- Total sales
- Total bills
- Average bill
- Top 10 selling items
- Top customers

Uses bill data from Firestore, filtered by logged-in user rules.

---

## 8. Inventory module

### `src/component/inventory/InventoryPage.jsx`

Inventory main features:
- Category / subcategory / item management
- Add/edit/delete item
- Search
- Stock fields
- Low stock support
- Price list print (PDF)
- Thermal print list (item + price only)

### Other inventory components

- `CategoryFilter.jsx`
- `SubcategoryManager.jsx`
- `ItemDrawerForm.jsx`
- `ItemTable.jsx`
- `ConfirmDialog.jsx`
- `SnackbarProvider.jsx`

They split big UI into smaller reusable parts.

---

## 9. Settings module (backup/import/delete)

### `src/component/ShopSettings.jsx`

Handles:
- Shop details
- Backup actions
- Import backup JSON
- Delete actions by scope

Current backup strategy:
- Creates one ZIP file
- Includes:
  - Full JSON backup
  - CSV exports
  - Summary PDF
  - All bill PDFs (for bills scope)

Delete scopes:
- Bills only
- Customer + inventory only

Safety:
- Backup runs before delete

---

## 10. Data layer (Firestore functions)

### `src/services/shopData.js`

This is the central data API for the app.
UI components call this file instead of writing raw Firestore code everywhere.

Main groups:

- Shop docs
- Bills
- Customers
- Inventory categories/subcategories/items
- Backup fetch by scope
- Scoped delete
- Duplicate-safe import

### Duplicate-safe import behavior

When importing backup JSON, it checks and skips duplicates:

- Bills:
  - Same bill ID, or
  - Same `createdAt + phone + total`
- Customers:
  - Same phone, or same name+address fallback
- Items:
  - Same name+code (root / nested by category+subcategory)

So import does not blindly duplicate records.

---

## 11. Firebase config and security

Files:
- `src/Firebase/firebase.js` (Firebase init)
- `firestore.rules` (Firestore security)
- `storage.rules` (Storage security)
- `firebase.json`, `.firebaserc` (project/deploy config)

Important rule idea:
- Bills are user-scoped:
  - User can read only bills where `bill.userId == request.auth.uid`

This is why multi-user data isolation works.

---

## 12. Local storage usage

Main keys used:

- `savedBills-{shopId}-{uid}`
  - Draft bills for later editing
- `item-history-{shopId}-{uid}`
  - Billing item name memory
- `dashboard-show-stats-{uid}`
  - Dashboard summary visibility
- `active-shop-id-{uid}`
  - Last active shop selection

---

## 13. Most important business protections in this code

1. Bill save + stock update in transaction
   - Prevents stock mismatch.
2. Verify-every-item gate before print/PDF
   - Prevents accidental incomplete billing.
3. Duplicate-safe import
   - Prevents repeated data flood.
4. Scope-based backup/delete
   - Safer operations (bills separate from customer/inventory).

---

## 14. If you want to extend this app next

Good next upgrades:

- Offline-first cache
- Due payment ledger
- Barcode scan
- Multi-payment split (cash + UPI)
- Staff roles (cashier/owner)
- Auto invoice numbering counter in Firestore

---

## 15. Quick troubleshooting map

- Thermal print blocked:
  - Check popup blocked in browser.
- “Missing or insufficient permissions”:
  - Check Firestore rules + active shop membership.
- Backup/import issues:
  - Use valid backup JSON from generated ZIP.
- Dev server `spawn EPERM`:
  - Usually Windows security or restricted shell child process.

---

## 16. One-line mental model

Think of this app as:

**Billing engine + inventory engine + customer memory + reporting + safe backup tools**

all tied together with shop-scoped and user-scoped Firebase rules.

