# Dokan Pro Manual Test Checklist

Release: __________
Date: __________
Tester: __________
Environment: Local / Staging / Production

## 1) Smoke Test
- [ ] Login works (Google / configured auth method)
- [ ] App loads without red error toasts
- [ ] Billing page opens
- [ ] Dashboard page opens
- [ ] Inventory page opens
- [ ] Settings page opens

## 2) Data Isolation (Multi-user)
- [ ] Account A creates sample bill and inventory item
- [ ] Logout and login with Account B
- [ ] Account B cannot see Account A data
- [ ] Account B creates own data
- [ ] Login back to Account A and confirm no Account B data leakage

## 3) Inventory - Categories/Subcategories
- [ ] Add category
- [ ] Edit category
- [ ] Delete category with no linked data
- [ ] Prevent category delete when subcategories/items exist
- [ ] Add subcategory under selected category
- [ ] Edit subcategory
- [ ] Delete subcategory with no linked items
- [ ] Prevent subcategory delete when linked items exist

## 4) Inventory - Items
- [ ] Add item without image
- [ ] Add item with image (if enabled)
- [ ] Item appears immediately (no refresh needed)
- [ ] Item persists after refresh
- [ ] Edit item name/price/category/subcategory/code
- [ ] Delete item with confirm dialog
- [ ] Search filters items instantly
- [ ] Category filter works

## 5) Billing - Core Flow
- [ ] Add/select customer (name, phone, address)
- [ ] Add multiple bill items (price/unit/quantity)
- [ ] Verify checklist can mark items
- [ ] Generate Bill works
- [ ] Saved bill appears in history
- [ ] No string-concatenated total bug (totals are numeric and correct)

## 6) Thermal Print
- [ ] Thermal print opens preview/window
- [ ] Bill saves before print
- [ ] No duplicate saves on repeated print clicks
- [ ] Price/unit shown correctly in thermal output

## 7) Customer Info + Autofill
- [ ] Customer list shows name/phone/address
- [ ] Search by name works
- [ ] Search by number works
- [ ] Autofill fills matching phone/address in billing form
- [ ] Same name + different phone are handled as separate customers

## 8) Draft Bills
- [ ] Save for later works with existing line items
- [ ] Draft visible after refresh
- [ ] Load draft works
- [ ] Delete draft works

## 9) Dashboard
- [ ] Today sales count is correct
- [ ] Total bills count is correct
- [ ] Customer count is correct
- [ ] Date filter works (3/7/15/30/custom)
- [ ] Show/hide summary toggle works
- [ ] Summary visibility persists after refresh

## 10) Settings
- [ ] Shop settings save successfully
- [ ] Settings persist after refresh
- [ ] Different users have isolated settings

## 11) Validation + Error Handling
- [ ] Required input validation shows clear message
- [ ] Invalid price/quantity blocked
- [ ] Empty bill generation blocked
- [ ] Firebase/network errors show user-friendly snackbar
- [ ] App does not crash on error

## 12) Mobile Responsive
- [ ] Inventory toolbar usable on mobile width
- [ ] Drawer form usable on mobile width
- [ ] Billing form usable on mobile width
- [ ] Navbar/tabs usable on mobile width
- [ ] No text overlap or cut-off

## Final Sign-off
- [ ] Ready for deployment
- [ ] Known issues documented

Notes:
- __________________________________________
- __________________________________________
- __________________________________________
