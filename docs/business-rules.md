# Business Rules & Validation

## BR-01 — Only Available Products Can Be Purchased
A customer can purchase a product only when sufficient stock is available.

### Validation
- Out-of-stock products cannot be added to the cart or ordered.
- Stock availability is checked again during checkout.

## BR-02 — Zero Stock Means Unavailable
A product is considered unavailable when its stock reaches zero.

### Validation
- Stock cannot be negative.
- Products with stock equal to zero cannot be purchased.

## BR-03 — No Duplicate Cart Products
A cart must not contain duplicate entries for the same product.

### Validation
- Adding an existing product updates its quantity.
- A duplicate cart row is not created.
- The database also enforces cart uniqueness.

## BR-04 — Empty Cart Cannot Be Ordered
Customers cannot place an order when the cart contains no items.

### Validation
- Checkout is rejected when the cart is empty.
- The server performs the authoritative validation.

## BR-05 — Customers Can View Only Their Own Orders
A customer can access only orders belonging to their authenticated user account.

### Validation
- Order history queries are filtered by the logged-in user's ID.
- A user cannot request another user's orders through the API.

## BR-06 — Only Administrators Can Manage Products
Only users with administrator privileges can add or edit products.

### Validation
- Product management APIs require authentication.
- Non-admin users are rejected from product management operations.
- Admin access is checked on the server.

---

# General Validations

## User Validation
- Name is mandatory.
- Email is mandatory.
- Email must have a valid format.
- Email addresses must be unique, case-insensitively.
- Password must contain at least 8 characters.

## Product Validation
- Product name is mandatory.
- Category is mandatory.
- Price must be greater than or equal to zero.
- Stock must be greater than or equal to zero.
- Missing product images should use a default image.

## Cart Validation
- Quantity must be at least 1.
- Quantity cannot exceed available stock.
- Adding an existing product updates its quantity.

## Order Validation
- Empty carts cannot be checked out.
- Stock is revalidated during checkout.
- Out-of-stock products cannot be ordered.
- Order status must be one of:
  - Pending
  - Confirmed
  - Shipped
  - Delivered
  - Cancelled
- Delivered orders cannot be cancelled.
- Cancelled orders remain visible in order history with status `Cancelled`.

---

# Edge-Case Handling

## Stock Becomes Zero During Checkout
The checkout operation must re-check stock. If stock is insufficient, the order is rejected instead of creating an invalid order.

## Browser Refresh
Cart data should remain available after refreshing checkout.

## Duplicate Product Addition
Adding the same product again increases the existing cart quantity.

## Negative Quantity
Negative or zero quantities are rejected.

## Multiple Browser Tabs
Cart state should remain consistent because cart data is stored server-side rather than only in browser memory.

## Cancellation
Only Pending and Confirmed orders can be cancelled. Delivered orders cannot be cancelled.
