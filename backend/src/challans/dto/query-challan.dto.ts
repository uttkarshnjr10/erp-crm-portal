import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ChallanStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryChallanDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ChallanStatus)
  status?: ChallanStatus;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}
