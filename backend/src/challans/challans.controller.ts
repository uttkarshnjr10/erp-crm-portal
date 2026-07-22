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
import { ChallansService } from './challans.service';
import { CreateChallanDto } from './dto/create-challan.dto';
import { UpdateChallanStatusDto } from './dto/update-challan-status.dto';
import { QueryChallanDto } from './dto/query-challan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('challans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChallansController {
  constructor(private readonly challansService: ChallansService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SALES)
  async create(
    @Body() dto: CreateChallanDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.challansService.create(dto, user.id);
  }

  @Get()
  async findAll(@Query() query: QueryChallanDto) {
    return this.challansService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.challansService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SALES)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChallanStatusDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.challansService.updateStatus(id, dto, user.id);
  }
}
