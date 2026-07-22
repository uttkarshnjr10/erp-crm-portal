import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { CustomerStatus, Prisma } from '@prisma/client';
import {
  getPaginationMeta,
  getPrismaSkipTake,
} from '../common/helpers/pagination.helper';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto, userId: string) {
    const data: Prisma.CustomerCreateInput = {
      name: dto.name,
      mobile: dto.mobile,
      email: dto.email,
      businessName: dto.businessName,
      gstNumber: dto.gstNumber,
      type: dto.type,
      address: dto.address,
      status: dto.status,
      followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
    };

    const customer = await this.prisma.customer.create({ data });

    // create follow-up if notes exist
    if (dto.notes) {
      await this.prisma.followUp.create({
        data: {
          customerId: customer.id,
          note: dto.notes,
          createdById: userId,
        },
      });
    }

    return customer;
  }

  async findAll(query: QueryCustomerDto) {
    const { skip, take } = getPrismaSkipTake(query);

    const where: Prisma.CustomerWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { mobile: { contains: query.search, mode: 'insensitive' } },
        { businessName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { followUps: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      ...getPaginationMeta(total, query),
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { id: true, name: true } },
          },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            challanNumber: true,
            totalQuantity: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: { challans: true, followUps: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    try {
      const data: Prisma.CustomerUpdateInput = {
        ...dto,
        followUpDate: dto.followUpDate
          ? new Date(dto.followUpDate)
          : undefined,
      };

      return await this.prisma.customer.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Customer not found');
      }
      throw error;
    }
  }

  async updateStatus(id: string, status: CustomerStatus) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customer.update({
      where: { id },
      data: { status },
    });
  }

  async createFollowUp(customerId: string, dto: CreateFollowUpDto, userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.followUp.create({
      data: {
        customerId,
        note: dto.note,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async getFollowUps(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.followUp.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  }
}
