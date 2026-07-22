import { IsNotEmpty, IsString, IsInt, IsEnum, Min } from 'class-validator';
import { MovementType } from '@prisma/client';

export class AdjustStockDto {
  @IsInt()
  @Min(1, { message: 'Quantity must be a positive integer' })
  quantity!: number;

  @IsEnum(MovementType)
  @IsNotEmpty()
  movementType!: MovementType;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
