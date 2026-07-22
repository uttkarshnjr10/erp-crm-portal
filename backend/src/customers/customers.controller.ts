import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, CustomerStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(CustomerStatus)
  @IsNotEmpty()
  status!: CustomerStatus;
}

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SALES)
  async create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.customersService.create(dto, user.id);
  }

  @Get()
  async findAll(@Query() query: QueryCustomerDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SALES)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.customersService.updateStatus(id, dto.status);
  }

  @Post(':id/follow-ups')
  @Roles(Role.ADMIN, Role.SALES)
  async createFollowUp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateFollowUpDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.customersService.createFollowUp(id, dto, user.id);
  }

  @Get(':id/follow-ups')
  async getFollowUps(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.getFollowUps(id);
  }
}
