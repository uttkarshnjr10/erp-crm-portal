import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  Matches,
} from 'class-validator';
import { CustomerType, CustomerStatus } from '@prisma/client';
import { IsGSTNumber } from '../../common/validators/gst.validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Mobile must be a valid 10-digit Indian mobile number',
  })
  mobile!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @IsOptional()
  @IsString()
  @IsGSTNumber()
  gstNumber?: string;

  @IsEnum(CustomerType)
  @IsNotEmpty()
  type!: CustomerType;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status: CustomerStatus = CustomerStatus.LEAD;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
