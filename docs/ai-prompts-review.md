# AI Prompts & AI Output Review

## AI Prompt 1 — Requirements Analysis

### Prompt
Analyze the boutique e-commerce assessment requirements and identify the functional requirements, validations, business rules, edge cases, and ambiguous requirements that should be clarified before development.

### Review
The AI output was reviewed against the original assessment requirements. Relevant requirements were retained and organized into functional areas. Ambiguous areas such as guest checkout, mobile verification, and duplicate email registration were explicitly documented with assumptions.

---

## AI Prompt 2 — E-Commerce Business Rules

### Prompt
Identify important business rules for an e-commerce application covering authentication, product stock, cart quantities, checkout, order status, cancellation, and administrator permissions.

### Review
The suggested rules were reviewed and aligned with the assessment. Stock validation at checkout, prevention of duplicate cart products, quantity validation, order cancellation rules, and administrator-only product management were included.

---

## AI Prompt 3 — Test Case Design

### Prompt
Create functional, negative, and edge-case test scenarios for registration, login, product search, cart operations, checkout, order history, dashboards, stock validation, and order cancellation.

### Review
The generated scenarios were reviewed for relevance and mapped to the assessment requirements. Both positive and negative scenarios were considered, including invalid login, empty fields, negative quantity, out-of-stock products, browser refresh, duplicate products, concurrent stock changes, and multiple browser tabs.

---

## AI Prompt 4 — Code Review

### Prompt
Review the e-commerce application's implementation for common functional problems involving API routes, authentication, cart updates, checkout, stock validation, order status, dashboards, and authorization.

### Review
The AI suggestions were treated as recommendations rather than automatically accepted changes. Implementation issues were manually tested and corrected where necessary, including route mismatches and dashboard API integration.

---

## AI Usage Principle

AI was used as an assistance and review tool. Generated suggestions were manually reviewed before being incorporated into the application. Functional behavior was verified through application testing rather than relying only on AI-generated output.
