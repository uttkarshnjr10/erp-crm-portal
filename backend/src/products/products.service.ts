import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { MovementType, Prisma } from '@prisma/client';
import {
  getPaginationMeta,
  getPrismaSkipTake,
} from '../common/helpers/pagination.helper';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto, userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: dto.name,
            sku: dto.sku,
            categoryId: dto.categoryId,
            unitPrice: dto.unitPrice,
            currentStock: dto.currentStock,
            minStockAlert: dto.minStockAlert,
            location: dto.location,
          },
          include: {
            category: { select: { id: true, name: true } },
          },
        });

        if (dto.currentStock > 0) {
          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantity: dto.currentStock,
              movementType: MovementType.IN,
              reason: 'Initial stock',
              createdById: userId,
            },
          });
        }

        return {
          ...product,
          isLowStock: product.currentStock <= product.minStockAlert,
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
      }
      throw error;
    }
  }

  async findAll(query: QueryProductDto) {
    const { skip, take } = getPrismaSkipTake(query);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // filter low stock products in memory since prisma lacks column comparison
    if (query.lowStock === true) {
      const allMatching = await this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const lowStockProducts = allMatching
        .filter((p) => p.currentStock <= p.minStockAlert)
        .map((item) => ({
          ...item,
          isLowStock: true,
        }));

      const total = lowStockProducts.length;
      const paginatedItems = lowStockProducts.slice(skip, skip + take);

      return {
        items: paginatedItems,
        ...getPaginationMeta(total, query),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    const enrichedItems = items.map((item) => ({
      ...item,
      isLowStock: item.currentStock <= item.minStockAlert,
    }));

    return {
      items: enrichedItems,
      ...getPaginationMeta(total, query),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      isLowStock: product.currentStock <= product.minStockAlert,
    };
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      const updated = await this.prisma.product.update({
        where: { id },
        data: dto,
        include: {
          category: { select: { id: true, name: true } },
        },
      });

      return {
        ...updated,
        isLowStock: updated.currentStock <= updated.minStockAlert,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Product not found');
      }
      throw error;
    }
  }

  async softDelete(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const draftChallanCount = await this.prisma.challanItem.count({
      where: {
        productId: id,
        challan: { status: 'DRAFT' },
      },
    });

    if (draftChallanCount > 0) {
      throw new BadRequestException(
        'Cannot deactivate product with active draft challans',
      );
    }

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Product deactivated successfully' };
  }

  async adjustStock(id: string, dto: AdjustStockDto, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      dto.movementType === MovementType.OUT &&
      product.currentStock - dto.quantity < 0
    ) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.currentStock}, Requested: ${dto.quantity}`,
      );
    }

    const stockChange =
      dto.movementType === MovementType.IN ? dto.quantity : -dto.quantity;

    const [updatedProduct, movement] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id },
        data: {
          currentStock: { increment: stockChange },
        },
        include: {
          category: { select: { id: true, name: true } },
        },
      }),
      this.prisma.stockMovement.create({
        data: {
          productId: id,
          quantity: dto.quantity,
          movementType: dto.movementType,
          reason: dto.reason,
          createdById: userId,
        },
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      product: {
        ...updatedProduct,
        isLowStock:
          updatedProduct.currentStock <= updatedProduct.minStockAlert,
      },
      movement,
    };
  }

  async getStockMovements(id: string, query: PaginationDto) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { skip, take } = getPrismaSkipTake(query);

    const where: Prisma.StockMovementWhereInput = { productId: id };

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      items,
      ...getPaginationMeta(total, query),
    };
  }
}
