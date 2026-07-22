# ERP + CRM Operations Portal

## Overview
A comprehensive Operations Management Portal tailored for wholesale and distribution companies. This system provides role-based access for Admins, Sales, Warehouse, and Accounts staff to manage customers, inventory, and sales challans efficiently.

## Architecture

```text
+-----------------------+       +-----------------------+       +-----------------------+
|                       |       |                       |       |                       |
|   Frontend (React)    | ----> |   Backend (NestJS)    | ----> |  PostgreSQL Database  |
|                       |       |                       |       |                       |
+-----------------------+       +-----------------------+       +-----------------------+
      |                               |                               |
      | - React 18 & Vite             | - NestJS 10                   | - PostgreSQL 15
      | - Tailwind CSS 3              | - Prisma ORM                  | - Persistent Data Volume
      | - React Query (Caching)       | - JWT Authentication          |
      | - Axios & Interceptors        | - Class Validator             |
```

### Architectural Decisions
- **NestJS**: Chosen for its robust, scalable architecture, dependency injection, and opinionated module structure, which is ideal for enterprise applications compared to raw Express.
- **Prisma**: Provides type-safe database queries, auto-generated schemas, and seamless integration with TypeScript and NestJS, avoiding the verbose setup of TypeORM or Sequelize.
- **React Query**: Handles server state, caching, and background synchronization on the frontend effortlessly.
- **Stateless Auth (JWT)**: Ensures scalable authentication without session storage overhead, handled via HTTP Bearer tokens.

## Features
- **Auth Module**: JWT-based login with Role-Based Access Control (RBAC).
- **Customers (CRM)**: Manage customer details, statuses (LEAD, ACTIVE, INACTIVE), types (RETAIL, WHOLESALE, DISTRIBUTOR), and track follow-up history.
- **Products (Inventory)**: SKU tracking, stock level monitoring with low stock alerts, and soft deletion.
- **Inventory Movements**: Atomic stock adjustments tracking IN and OUT movements with reasons and timestamps.
- **Challans (Sales)**: Complex state machine for challans (DRAFT → CONFIRMED → CANCELLED) with automatic stock deduction on confirmation and stock restoration on cancellation. Includes point-in-time snapshots of products.
- **Dashboard**: High-level aggregated statistics and recent activities overview.

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### With Docker (Easiest)
Make sure Docker Desktop is running.
```bash
cp backend/.env.example backend/.env
# Optional: Edit backend/.env to match docker credentials if necessary
docker-compose up --build
```

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@erp.com | Password@123 |
| Sales | sales@erp.com | Password@123 |
| Warehouse | warehouse@erp.com | Password@123 |
| Accounts | accounts@erp.com | Password@123 |

## API Documentation
A complete Postman collection is available at:
`backend/postman/erp-crm-api.postman_collection.json`

Base URL: `http://localhost:3001/api/v1`

## Deployment

### Backend (Railway)
1. Connect your GitHub repository to Railway.
2. Add a PostgreSQL database plugin in Railway.
3. Set the following environment variables:
   - `DATABASE_URL` (from the Railway Postgres plugin)
   - `JWT_SECRET` (generate a secure random string)
   - `PORT` (Railway will assign this, but you can set a default)
4. Railway will automatically detect the Dockerfile or Node.js environment and deploy.

### Frontend (Vercel)
1. Import the repository to Vercel.
2. Select the `frontend` directory as the Root Directory.
3. Set the Build Command: `npm run build`
4. Set the Output Directory: `dist`
5. Set Environment Variables:
   - `VITE_API_BASE_URL` (URL of your deployed Railway backend API, e.g., `https://your-app.up.railway.app/api/v1`)
6. Deploy.

### Database (Neon.tech)
If you prefer a managed serverless Postgres database (like Neon) instead of Railway's plugin:
1. Create a project on Neon.
2. Copy the connection string.
3. Provide the connection string as the `DATABASE_URL` in your backend deployment platform.

## Known Limitations / Assumptions
- **Invoice PDF Export**: Not implemented in this phase.
- **Password Reset**: Email-based password recovery is not included.
- **Advanced Pagination**: Currently supports basic page/limit, but cursor-based pagination might be better for extremely large datasets.
- **Currency**: Hardcoded to INR (`en-IN` formatting).
