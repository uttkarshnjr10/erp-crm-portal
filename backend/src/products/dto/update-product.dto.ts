import {
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Unit price must be a positive number' })
  unitPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockAlert?: number;

  @IsOptional()
  @IsString()
  location?: string;
}
