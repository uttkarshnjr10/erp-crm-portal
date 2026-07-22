import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChallanStatus } from '@prisma/client';

export class ChallanItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;
}

export class CreateChallanDto {
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one item is required' })
  @ValidateNested({ each: true })
  @Type(() => ChallanItemDto)
  items!: ChallanItemDto[];

  @IsOptional()
  @IsEnum(ChallanStatus, {
    message: 'Status must be DRAFT or CONFIRMED',
  })
  status: ChallanStatus = ChallanStatus.DRAFT;
}
