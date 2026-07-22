# Mini ERP + CRM Operations Portal
A comprehensive, full-stack Operations Management Portal tailored for wholesale and distribution companies to manage customers, inventory, and sales challans efficiently.

## 🚀 Live Demo

- 🌐 **Live App**: [https://erp-crm-portal.vercel.app](https://erp-crm-portal.vercel.app) *(Update with your actual Vercel URL)*
- 📡 **API Base**: [https://erp-crm-portal-io1k.onrender.com/api/v1](https://erp-crm-portal-io1k.onrender.com/api/v1)

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@erp.com | Password@123 |
| Sales | sales@erp.com | Password@123 |
| Warehouse | warehouse@erp.com | Password@123 |
| Accounts | accounts@erp.com | Password@123 |

## 🛠 Tech Stack

### Backend
- **NestJS 10** — Modular architecture with built-in dependency injection, guards, and interceptors for scalable enterprise apps.
- **TypeScript** — Ensures type safety across the entire codebase and prevents runtime errors.
- **Prisma ORM** — Provides intuitive, type-safe database queries and seamless schema migrations.
- **PostgreSQL (Neon)** — Robust relational database handling complex transactions and data integrity.
- **JWT (Passport)** — Stateless authentication mechanism for secure, scalable role-based access control.

### Frontend
- **React 18** — Component-based UI library for building dynamic, responsive user interfaces.
- **TypeScript** — Enforces strict typing, reducing bugs and improving developer experience.
- **Tailwind CSS 3** — Utility-first CSS framework for rapid, highly customizable UI styling without writing custom CSS.
- **React Query** — Handles server state, data fetching, caching, and background synchronization effortlessly.
- **Axios** — Robust HTTP client used with interceptors to automatically attach JWT tokens to requests.

## ✨ Features

- **Auth**
  - [x] JWT-based login (24h expiry)
  - [x] Role-Based Access Control (Admin, Sales, Warehouse, Accounts)
  - [x] Fetch current user profile

- **Customers (CRM)**
  - [x] Manage customer profiles (Create, Read, Update)
  - [x] Customer statuses (LEAD, ACTIVE, INACTIVE) and types (RETAIL, WHOLESALE, DISTRIBUTOR)
  - [x] Add and view paginated follow-up notes
  - [x] View customer-specific challan summary

- **Products (Inventory)**
  - [x] Comprehensive product catalog with SKU tracking
  - [x] Atomic stock adjustments (IN/OUT) with reason tracking
  - [x] Low stock alerts based on minimum stock threshold
  - [x] Paginated stock movement history
  - [x] Soft deletion of products (Admin only)

- **Categories**
  - [x] Manage product categories
  - [x] View product count per category

- **Challans (Sales)**
  - [x] Create Sales Challans with line items
  - [x] Store point-in-time product snapshots (name, SKU, unit price)
  - [x] Complex state machine: DRAFT → CONFIRMED → CANCELLED
  - [x] Atomic stock deduction upon Confirmation via Prisma Transactions
  - [x] Stock restoration upon Cancellation
  - [x] Guard against negative stock during confirmation
  - [ ] PDF export for Challans

- **Dashboard**
  - [x] Aggregated statistics (total customers, products, challans, low stock count)
  - [x] Recent challan activity feed

## 🏗 Architecture

```text
+-----------------------+       +-----------------------+       +-----------------------+
|                       |       |                       |       |                       |
|   Frontend (React)    | ----> |   Backend (NestJS)    | ----> |  PostgreSQL Database  |
|                       |       |                       |       |                       |
+-----------------------+       +-----------------------+       +-----------------------+
      |                               |                               |
      | - React 18 & Vite             | - NestJS 10                   | - PostgreSQL (Neon)
      | - Tailwind CSS 3              | - Prisma ORM                  | - Fully Relational
      | - React Query (Caching)       | - JWT Authentication          | - ACID Transactions
      | - Axios & Interceptors        | - Class Validator             |
```

**Key Business Logic Implementations:**
- **Atomic Transactions**: Challan confirmation uses Prisma `$transaction` to ensure stock is accurately deducted without race conditions.
- **Negative Stock Protection**: The backend actively verifies that `currentStock >= requestedQuantity` and returns precise errors if constraints are violated.
- **Historical Accuracy**: Challan items capture product prices and names at the time of creation, ensuring historical data remains intact even if product pricing changes later.
