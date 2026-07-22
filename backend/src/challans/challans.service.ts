import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChallanDto } from './dto/create-challan.dto';
import { UpdateChallanStatusDto } from './dto/update-challan-status.dto';
import { QueryChallanDto } from './dto/query-challan.dto';
import { ChallanStatus, MovementType, Prisma } from '@prisma/client';
import {
  getPaginationMeta,
  getPrismaSkipTake,
} from '../common/helpers/pagination.helper';

export interface ChallanItemWithSubtotal {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: Prisma.Decimal;
  quantity: number;
  subtotal: number;
}

@Injectable()
export class ChallansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * generate challan number format CH-YYYYMMDD-XXXX.
   * run inside transaction to prevent race conditions.
   */
  private async generateChallanNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // count challans created today
    const todayStart = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(year, now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

    const todayCount = await tx.challan.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });

    const seq = String(todayCount + 1).padStart(4, '0');
    return `CH-${dateStr}-${seq}`;
  }

  async create(dto: CreateChallanDto, userId: string) {
    // prevent duplicate product ids
    const productIds = dto.items.map((item) => item.productId);
    const uniqueProductIds = new Set(productIds);
    if (uniqueProductIds.size !== productIds.length) {
      throw new BadRequestException('Duplicate product IDs in challan items');
    }

    // allow only DRAFT or CONFIRMED status
    if (
      dto.status !== ChallanStatus.DRAFT &&
      dto.status !== ChallanStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Challan can only be created with DRAFT or CONFIRMED status',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: dto.customerId },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      if (customer.status === 'INACTIVE') {
        throw new BadRequestException(
          'Cannot create challan for inactive customer',
        );
      }

      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of dto.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (!product.isActive) {
          throw new BadRequestException(`Product ${product.name} is inactive`);
        }

        if (
          dto.status === ChallanStatus.CONFIRMED &&
          product.currentStock < item.quantity
        ) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`,
          );
        }
      }

      const challanNumber = await this.generateChallanNumber(tx);

      const totalQuantity = dto.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      if (totalQuantity === 0) {
        throw new BadRequestException('Total quantity cannot be zero');
      }

      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: dto.customerId,
          totalQuantity,
          status: dto.status,
          createdById: userId,
          items: {
            create: dto.items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                productName: product.name,
                productSku: product.sku,
                unitPrice: product.unitPrice,
                quantity: item.quantity,
              };
            }),
          },
        },
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              name: true,
              mobile: true,
              businessName: true,
              gstNumber: true,
            },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // deduct stock for confirmed challans
      if (dto.status === ChallanStatus.CONFIRMED) {
        for (const item of dto.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: MovementType.OUT,
              reason: `Challan ${challanNumber}`,
              createdById: userId,
            },
          });
        }
      }

      return this.enrichChallanResponse(challan);
    });
  }

  async findAll(query: QueryChallanDto) {
    const { skip, take } = getPrismaSkipTake(query);

    const where: Prisma.ChallanWhereInput = {};

    if (query.search) {
      where.challanNumber = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    const [items, total] = await Promise.all([
      this.prisma.challan.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, mobile: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.challan.count({ where }),
    ]);

    return {
      items,
      ...getPaginationMeta(total, query),
    };
  }

  async findOne(id: string) {
    const challan = await this.prisma.challan.findUnique({
      where: { id },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            mobile: true,
            businessName: true,
            gstNumber: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!challan) {
      throw new NotFoundException('Challan not found');
    }

    return this.enrichChallanResponse(challan);
  }

  async updateStatus(
    id: string,
    dto: UpdateChallanStatusDto,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw new NotFoundException('Challan not found');
      }

      const currentStatus = challan.status;
      const newStatus = dto.status;

      // block changes to cancelled challans
      if (currentStatus === ChallanStatus.CANCELLED) {
        throw new BadRequestException(
          'Cancelled challan cannot be modified',
        );
      }

      // confirmed challans can only be cancelled
      if (
        currentStatus === ChallanStatus.CONFIRMED &&
        newStatus !== ChallanStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'Confirmed challan can only be cancelled',
        );
      }

      // handle draft to confirmed transition
      if (
        currentStatus === ChallanStatus.DRAFT &&
        newStatus === ChallanStatus.CONFIRMED
      ) {
        // check stock availability before confirming
        const productIds = challan.items.map((item) => item.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));

        for (const item of challan.items) {
          const product = productMap.get(item.productId);

          if (!product || !product.isActive) {
            throw new BadRequestException(
              `Product ${item.productName} is no longer available`,
            );
          }

          if (product.currentStock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${item.productName}. Available: ${product.currentStock}, Requested: ${item.quantity}`,
            );
          }
        }

        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: MovementType.OUT,
              reason: `Challan ${challan.challanNumber}`,
              createdById: userId,
            },
          });
        }
      }

      // no stock adjustments needed for draft cancellation

      // restore stock when cancelling confirmed challan
      if (
        currentStatus === ChallanStatus.CONFIRMED &&
        newStatus === ChallanStatus.CANCELLED
      ) {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: MovementType.IN,
              reason: `Challan ${challan.challanNumber} cancelled`,
              createdById: userId,
            },
          });
        }
      }

      const updated = await tx.challan.update({
        where: { id },
        data: { status: newStatus },
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              name: true,
              mobile: true,
              businessName: true,
              gstNumber: true,
            },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      return this.enrichChallanResponse(updated);
    });
  }

  /**
   * compute subtotal per item and total amount.
   * cast prisma Decimal to number.
   */
  private enrichChallanResponse(challan: {
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      productSku: string;
      unitPrice: Prisma.Decimal;
      quantity: number;
      challanId: string;
    }>;
    [key: string]: unknown;
  }) {
    const enrichedItems: ChallanItemWithSubtotal[] = challan.items.map(
      (item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: Number(item.unitPrice) * item.quantity,
      }),
    );

    const totalAmount = enrichedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    return {
      ...challan,
      items: enrichedItems,
      totalAmount,
    };
  }
}
