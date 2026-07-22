import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Prisma } from '@prisma/client';

export interface CategoryWithCount {
  id: string;
  name: string;
  createdAt: Date;
  _count: {
    products: number;
  };
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryWithCount[]> {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateCategoryDto): Promise<{ id: string; name: string; createdAt: Date }> {
    try {
      return await this.prisma.category.create({
        data: { name: dto.name },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
      throw error;
    }
  }
}
