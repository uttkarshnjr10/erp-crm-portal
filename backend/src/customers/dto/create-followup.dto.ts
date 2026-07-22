import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateFollowUpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Follow-up note must be at least 5 characters' })
  note!: string;
}
