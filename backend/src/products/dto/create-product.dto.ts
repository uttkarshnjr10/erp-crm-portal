import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9\-]+$/, {
    message: 'SKU must be uppercase alphanumeric with hyphens, no spaces',
  })
  sku!: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Unit price must be a positive number' })
  unitPrice!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockAlert: number = 0;

  @IsOptional()
  @IsString()
  location?: string;
}
