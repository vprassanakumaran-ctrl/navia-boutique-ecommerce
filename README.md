# Navia Boutique — E-Commerce Assessment

A full-stack boutique e-commerce application developed for the Navia Markets Limited assessment.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite
- Authentication: Express Session + bcrypt

## Features

### Customer
- User registration and login
- Profile management
- Password reset
- Product catalog
- Search and category filtering
- Product details
- Add/remove/update cart items
- Stock validation
- Checkout
- Order history
- Order cancellation
- Customer dashboard

### Admin
- Admin dashboard
- Total users
- Total products
- Total orders
- Revenue
- Low-stock products
- Add products
- Edit products
- Backend admin authorization

## Business Rules

- Email addresses must be unique.
- Password must contain at least 8 characters.
- Product price and stock cannot be negative.
- Cart quantity must be at least 1 and cannot exceed available stock.
- Duplicate products increase the existing cart quantity.
- Out-of-stock products cannot be purchased.
- Checkout validates stock again before creating an order.
- Empty carts cannot be checked out.
- Only administrators can create or edit products.
- Pending and Confirmed orders can be cancelled.
- Delivered orders cannot be cancelled.
- Cancelled orders remain visible in order history.

## Edge Cases

The application considers:
- Stock becoming unavailable during checkout
- Browser refresh during checkout
- Duplicate product additions
- Negative or zero quantities
- Multiple browser tabs
- Concurrent orders competing for limited stock

## Documentation

- `docs/requirements.md` — Requirement analysis
- `docs/business-rules.md` — Business rules and validations
- `docs/assumptions.md` — Assumptions and ambiguous requirements
- `docs/ai-prompts-review.md` — AI prompts and output review
- `docs/test-cases.md` — Functional, negative and edge-case test cases

## Running the Application

### Backend

```bash
cd backend
npm install
npm run dev
