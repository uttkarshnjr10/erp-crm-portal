# Submission Summary

**Project Name:** Mini ERP + CRM Operations Portal

## Links
- **GitHub Repository**: [https://github.com/uttkarshnjr10/erp-crm-portal](https://github.com/uttkarshnjr10/erp-crm-portal)
- **Live Frontend (Vercel)**: [https://erp-crm-portal.vercel.app](https://erp-crm-portal.vercel.app) *(Update with actual URL)*
- **Live Backend (Render)**: [https://erp-crm-portal-io1k.onrender.com/api/v1](https://erp-crm-portal-io1k.onrender.com/api/v1)

## Key Achievements
1. **Full-Stack Implementation**: Built a robust, production-ready NestJS backend and a highly responsive React frontend.
2. **Complex Business Logic**: Successfully implemented the DRAFT → CONFIRMED → CANCELLED state machine for sales challans with atomic stock adjustments.
3. **Role-Based Access**: Secure JWT authentication with strict Role Guards restricting access based on user roles (Admin, Sales, Warehouse, Accounts).
4. **Data Integrity**: Implemented point-in-time snapshots for challan items and Prisma transactions to prevent negative stock anomalies.
5. **Modern Tech Stack**: Leveraged Tailwind CSS, React Query, Prisma ORM, and PostgreSQL for an optimal developer and user experience.

## Testing the App
Use the credentials below to test the live application:
- **Admin**: `admin@erp.com` / `Password@123`
- **Sales**: `sales@erp.com` / `Password@123`
- **Warehouse**: `warehouse@erp.com` / `Password@123`
- **Accounts**: `accounts@erp.com` / `Password@123`

## API Documentation
The complete Postman collection for evaluating the API is available in the repository at:
`backend/postman/erp-crm-api.postman_collection.json`
