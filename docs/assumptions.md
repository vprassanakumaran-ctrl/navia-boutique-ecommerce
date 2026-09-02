# Assumptions & Ambiguous Requirements

## 1. Guest Checkout

### Ambiguous Requirement
Should customers be allowed to checkout without creating an account?

### Decision
Guest checkout is not allowed.

### Reason
Orders, order history, cart ownership, and customer dashboard information require an authenticated user. Requiring login also provides clear ownership of orders.

---

## 2. Mobile Number Verification

### Ambiguous Requirement
Should mobile number verification be mandatory during registration?

### Decision
Mobile verification is not mandatory for this assessment.

### Reason
The core assessment focuses on e-commerce functionality. SMS/OTP verification would add an external service dependency without being necessary for the requested workflow.

---

## 3. Duplicate Email Registration

### Ambiguous Requirement
Can multiple users register using the same email address?

### Decision
No. Email addresses must be unique.

### Reason
Email is used as the user's login identifier. Allowing duplicates could cause authentication and account ownership conflicts.

---

## 4. Email Comparison

Email addresses are treated as case-insensitive for uniqueness. For example, `User@example.com` and `user@example.com` should represent the same email account.

---

## 5. Payment

No real payment gateway is required.

### Assumption
Checkout creates an order without processing an external payment.

---

## 6. Order Cancellation

### Decision
Pending and Confirmed orders can be cancelled. Delivered orders cannot be cancelled.

### Reason
This follows the assessment's explicit cancellation validation.

Cancelled orders remain visible in order history with the `Cancelled` status.

---

## 7. Low Stock

### Decision
A product with stock quantity of 5 or less is considered low stock.

### Reason
This provides a practical threshold for the admin dashboard.

---

## 8. Product Images

If a product does not have an image URL, the application should display a default product image rather than leaving the image area broken or empty.

---

## 9. Stock During Checkout

Stock must be validated again at checkout because another order may have reduced the available stock after the product was added to the cart.

If sufficient stock is no longer available, checkout is rejected.

---

## 10. Multiple Browser Tabs

Cart data is maintained server-side for the authenticated user. Therefore, changes made from another tab should be reflected when the cart is refreshed or reloaded.

---

## 11. Admin Access

Product creation and editing are restricted to authenticated administrators. Authorization is enforced on the backend rather than relying only on frontend visibility.
