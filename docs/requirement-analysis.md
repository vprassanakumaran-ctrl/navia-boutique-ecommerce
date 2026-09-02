# Requirement Analysis — Navia Boutique E-Commerce

## 1. Objective
Build a basic boutique e-commerce web application where customers can browse products, manage a shopping cart, and place orders.

## 2. User Management

### Requirements
- User registration
- User login
- User profile
- Password reset

### Validations
- Email must be unique.
- Password must contain at least 8 characters.
- Mandatory fields cannot be empty.
- Invalid email formats must be rejected.

## 3. Product Management

### Requirements
- View product catalog
- Search products
- Filter products by category
- View product details

### Product Information
- Product name
- Product image
- Price
- Category
- Available sizes
- Stock quantity
- Product description

### Validations
- Price cannot be negative.
- Stock quantity cannot be negative.
- Products without images should use a default image.
- Out-of-stock products cannot be purchased.

## 4. Shopping Cart

### Requirements
- Add products
- Remove products
- Update quantity
- Display total amount

### Validations
- Quantity must be at least 1.
- Quantity cannot exceed available stock.
- Adding the same product again must update its quantity instead of creating a duplicate entry.

## 5. Order Management

### Requirements
- Checkout
- Order confirmation
- Order history
- Order status

### Order Statuses
- Pending
- Confirmed
- Shipped
- Delivered
- Cancelled

### Validations
- Out-of-stock products cannot be ordered.
- Empty carts cannot be checked out.
- Delivered orders cannot be cancelled.

## 6. Dashboard

### Customer Dashboard
- Total orders
- Total amount spent
- Recently purchased products

### Admin Dashboard
- Total users
- Total products
- Total orders
- Revenue summary
- Low-stock products

## 7. Business Rules
- BR-01: A user can purchase only available products.
- BR-02: A product becomes unavailable when stock reaches zero.
- BR-03: A cart cannot contain duplicate products.
- BR-04: An order cannot be placed with an empty cart.
- BR-05: Users can only view their own orders.
- BR-06: Only administrators can add or edit products.

## 8. Edge Cases
- If stock becomes zero during checkout, display an error and do not create the order.
- Cart data should persist when the checkout page is refreshed.
- Adding the same product multiple times should update quantity.
- Negative quantities must be rejected.
- Cart data should remain consistent across multiple browser tabs.

## 9. Assumptions
- Guest checkout is not required; users must be authenticated before placing orders.
- Mobile number verification is not mandatory for the basic application.
- Email addresses are unique and case-insensitive.
- Payment gateway integration is outside the scope of this assessment.
- Order status is managed by the application/admin.
- Low stock is defined as stock quantity of 5 or less.

## 10. Implementation Summary
The application uses a React frontend with a Node.js/Express backend and SQLite database. Authentication is session-based, and business validations are enforced through backend APIs as well as the frontend interface.
