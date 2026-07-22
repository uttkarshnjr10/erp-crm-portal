import { IsEnum, IsNotEmpty } from 'class-validator';
import { ChallanStatus } from '@prisma/client';

export class UpdateChallanStatusDto {
  @IsEnum(ChallanStatus)
  @IsNotEmpty()
  status!: ChallanStatus;
}
