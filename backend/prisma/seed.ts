import { PrismaClient, Role, CustomerType, CustomerStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('starting seed...');

  // users
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  const usersData = [
    { name: 'System Admin', email: 'admin@erp.com', role: Role.ADMIN },
    { name: 'Sales User', email: 'sales@erp.com', role: Role.SALES },
    { name: 'Warehouse User', email: 'warehouse@erp.com', role: Role.WAREHOUSE },
    { name: 'Accounts User', email: 'accounts@erp.com', role: Role.ACCOUNTS },
  ];

  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: true,
      },
    });
  }

  console.log('users seeded');

  // categories
  const categoryNames = ['Electronics', 'Clothing', 'Stationery', 'Hardware', 'FMCG'];

  const categories: Record<string, { id: string }> = {};
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = category;
  }

  console.log('categories seeded');

  // customers
  const customersData = [
    {
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      email: 'rajesh@sharmadistributors.com',
      businessName: 'Sharma Distributors Pvt Ltd',
      gstNumber: '27AABCS1429B1Z5',
      type: CustomerType.DISTRIBUTOR,
      address: '45, MG Road, Andheri West, Mumbai, Maharashtra 400058',
      status: CustomerStatus.ACTIVE,
    },
    {
      name: 'Priya Mehta',
      mobile: '9123456789',
      email: 'priya@mehtaretail.in',
      businessName: 'Mehta Retail Store',
      gstNumber: '24BBZPM8756K1ZO',
      type: CustomerType.RETAIL,
      address: '12, CG Road, Navrangpura, Ahmedabad, Gujarat 380009',
      status: CustomerStatus.ACTIVE,
    },
    {
      name: 'Amit Patel',
      mobile: '9988776655',
      email: null,
      businessName: 'Patel Wholesale Traders',
      gstNumber: '29AAFCP7654M1Z9',
      type: CustomerType.WHOLESALE,
      address: '78, Commercial Street, Chickpet, Bangalore, Karnataka 560053',
      status: CustomerStatus.LEAD,
    },
    {
      name: 'Sunita Agarwal',
      mobile: '9871234567',
      email: 'sunita@agarwalenterprises.co.in',
      businessName: 'Agarwal Enterprises',
      gstNumber: '09AAECA3456F1Z2',
      type: CustomerType.WHOLESALE,
      address: '23, Hazratganj, Lucknow, Uttar Pradesh 226001',
      status: CustomerStatus.INACTIVE,
    },
    {
      name: 'Vikram Singh',
      mobile: '9654321098',
      email: 'vikram@singhsupply.com',
      businessName: 'Singh Supply Chain Solutions',
      gstNumber: '06AADCS9876P1Z3',
      type: CustomerType.DISTRIBUTOR,
      address: '56, Sector 17, Chandigarh 160017',
      status: CustomerStatus.LEAD,
      followUpDate: new Date('2026-08-15'),
    },
  ];

  for (const customerData of customersData) {
    const existing = await prisma.customer.findFirst({
      where: { mobile: customerData.mobile },
    });
    if (!existing) {
      await prisma.customer.create({ data: customerData });
    }
  }

  console.log('customers seeded');

  // products
  const productsData = [
    {
      name: 'Wireless Bluetooth Speaker',
      sku: 'PRD-001',
      categoryId: categories['Electronics'].id,
      unitPrice: 2499.00,
      currentStock: 150,
      minStockAlert: 15,
      location: 'Rack A1',
    },
    {
      name: 'USB-C Charging Cable 1m',
      sku: 'PRD-002',
      categoryId: categories['Electronics'].id,
      unitPrice: 349.00,
      currentStock: 200,
      minStockAlert: 20,
      location: 'Rack A2',
    },
    {
      name: 'Cotton Round Neck T-Shirt',
      sku: 'PRD-003',
      categoryId: categories['Clothing'].id,
      unitPrice: 599.00,
      currentStock: 120,
      minStockAlert: 15,
      location: 'Rack B1',
    },
    {
      name: 'Denim Jeans Slim Fit',
      sku: 'PRD-004',
      categoryId: categories['Clothing'].id,
      unitPrice: 1299.00,
      currentStock: 80,
      minStockAlert: 10,
      location: 'Rack B2',
    },
    {
      name: 'A4 Copier Paper 500 Sheets',
      sku: 'PRD-005',
      categoryId: categories['Stationery'].id,
      unitPrice: 275.00,
      currentStock: 180,
      minStockAlert: 20,
      location: 'Rack C1',
    },
    {
      name: 'Heavy Duty Claw Hammer',
      sku: 'PRD-006',
      categoryId: categories['Hardware'].id,
      unitPrice: 450.00,
      currentStock: 75,
      minStockAlert: 10,
      location: 'Rack D1',
    },
    {
      name: 'PVC Insulation Tape Roll',
      sku: 'PRD-007',
      categoryId: categories['Hardware'].id,
      unitPrice: 120.00,
      currentStock: 200,
      minStockAlert: 20,
      location: 'Rack D2',
    },
    {
      name: 'Premium Basmati Rice 5kg',
      sku: 'PRD-008',
      categoryId: categories['FMCG'].id,
      unitPrice: 549.00,
      currentStock: 100,
      minStockAlert: 15,
      location: 'Rack E1',
    },
  ];

  for (const productData of productsData) {
    await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData,
    });
  }

  console.log('products seeded');

  console.log('seed completed successfully!');
}

main()
  .catch((e: Error) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
