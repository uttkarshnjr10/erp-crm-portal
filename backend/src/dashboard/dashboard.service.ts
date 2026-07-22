import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChallanStatus, CustomerStatus } from '@prisma/client';

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  confirmedChallans: number;
  draftChallans: number;
  cancelledChallans: number;
  recentChallans: Array<{
    id: string;
    challanNumber: string;
    totalQuantity: number;
    status: ChallanStatus;
    createdAt: Date;
    customer: {
      id: string;
      name: string;
    };
  }>;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStats> {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      totalChallans,
      confirmedChallans,
      draftChallans,
      cancelledChallans,
      recentChallans,
      allProducts,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({
        where: { status: CustomerStatus.ACTIVE },
      }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.challan.count(),
      this.prisma.challan.count({
        where: { status: ChallanStatus.CONFIRMED },
      }),
      this.prisma.challan.count({
        where: { status: ChallanStatus.DRAFT },
      }),
      this.prisma.challan.count({
        where: { status: ChallanStatus.CANCELLED },
      }),
      this.prisma.challan.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          challanNumber: true,
          totalQuantity: true,
          status: true,
          createdAt: true,
          customer: {
            select: { id: true, name: true },
          },
        },
      }),
      // filter in memory because prisma cannot compare columns directly

      this.prisma.product.findMany({
        where: { isActive: true },
        select: { currentStock: true, minStockAlert: true },
      }),
    ]);

    const lowStockProducts = allProducts.filter(
      (p) => p.currentStock <= p.minStockAlert,
    ).length;

    return {
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts,
      totalChallans,
      confirmedChallans,
      draftChallans,
      cancelledChallans,
      recentChallans,
    };
  }
}
