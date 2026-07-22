import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  Matches,
} from 'class-validator';
import { CustomerType, CustomerStatus } from '@prisma/client';
import { IsGSTNumber } from '../../common/validators/gst.validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Mobile must be a valid 10-digit Indian mobile number',
  })
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  @IsGSTNumber()
  gstNumber?: string;

  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}
