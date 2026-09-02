# Test Cases

## Functional Test Cases

| ID | Test Case | Expected Result |
|---|---|---|
| TC-01 | Register with valid details | User account is created |
| TC-02 | Register with duplicate email | Registration is rejected |
| TC-03 | Register with invalid email | Validation error is shown |
| TC-04 | Register with missing mandatory field | Validation error is shown |
| TC-05 | Register with password below 8 characters | Registration is rejected |
| TC-06 | Login with valid credentials | User is logged in |
| TC-07 | Login with invalid credentials | Login is rejected |
| TC-08 | Search for a product | Matching products are displayed |
| TC-09 | Filter products by category | Products from selected category are displayed |
| TC-10 | View product details | Product information is displayed |
| TC-11 | Add product to cart | Product appears in cart |
| TC-12 | Add same product again | Existing cart quantity increases |
| TC-13 | Increase cart quantity | Quantity and total are updated |
| TC-14 | Decrease cart quantity | Quantity and total are updated |
| TC-15 | Remove product from cart | Product is removed |
| TC-16 | Checkout with valid cart | Order is created successfully |
| TC-17 | View order history | User's orders are displayed |
| TC-18 | View customer dashboard | Order count, amount spent and recent purchases are displayed |
| TC-19 | View admin dashboard | Users, products, orders, revenue and low-stock products are displayed |
| TC-20 | Admin creates product | Product is created |
| TC-21 | Admin edits product | Product is updated |
| TC-22 | Cancel pending order | Order becomes Cancelled |
| TC-23 | Cancel confirmed order | Order becomes Cancelled |

## Negative Test Cases

| ID | Test Case | Expected Result |
|---|---|---|
| NT-01 | Login with wrong password | Login is rejected |
| NT-02 | Submit empty registration fields | Validation errors are shown |
| NT-03 | Submit negative cart quantity | Request is rejected |
| NT-04 | Submit zero cart quantity | Request is rejected |
| NT-05 | Add out-of-stock product | Product cannot be purchased |
| NT-06 | Checkout with empty cart | Checkout is rejected |
| NT-07 | Checkout when stock is insufficient | Checkout is rejected |
| NT-08 | Non-admin attempts to create product | Access is denied |
| NT-09 | Non-admin attempts to edit product | Access is denied |
| NT-10 | Cancel delivered order | Cancellation is rejected |

## Edge-Case Test Cases

| ID | Test Case | Expected Result |
|---|---|---|
| EC-01 | Stock becomes zero before checkout | Checkout is rejected |
| EC-02 | Refresh checkout page | Cart remains available |
| EC-03 | Add duplicate product | Existing quantity is updated |
| EC-04 | Multiple browser tabs modify cart | Server-side cart remains consistent |
| EC-05 | Two orders compete for limited stock | Stock validation prevents invalid order |
| EC-06 | Cancelled order remains in order history | Order remains visible with Cancelled status |

## Test Result

The application was manually tested through the browser. Functional, negative, and edge-case scenarios were considered against the assessment requirements.

