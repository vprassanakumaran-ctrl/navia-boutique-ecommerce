# Known Issues and Limitations

## Known Limitations

1. No real payment gateway is integrated; checkout is simulated.
2. Mobile number verification is not implemented because it was treated as optional based on the ambiguous requirement analysis.
3. Guest checkout is not supported; users must log in before placing an order.
4. Order status transitions are basic and intended for assessment purposes.
5. Product images use a default image when an image is not provided.
6. Multiple-browser-tab consistency depends on refreshing the product/cart data from the server.
7. Concurrent checkout is protected by server-side stock validation, but no real-time locking mechanism is implemented.

## Assessment Scope

The application focuses on the mandatory assessment requirements. Optional bonus features such as wishlist, coupon codes, product reviews, recently viewed products, and AI recommendations were not implemented.
