import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CustomerType, CustomerStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryCustomerDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;
}
