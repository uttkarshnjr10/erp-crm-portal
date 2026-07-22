import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.WAREHOUSE)
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.productsService.create(dto, user.id);
  }

  @Get()
  async findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.WAREHOUSE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.softDelete(id);
  }

  @Post(':id/stock-adjust')
  @Roles(Role.ADMIN, Role.WAREHOUSE)
  async adjustStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.productsService.adjustStock(id, dto, user.id);
  }

  @Get(':id/stock-movements')
  async getStockMovements(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationDto,
  ) {
    return this.productsService.getStockMovements(id, query);
  }
}
