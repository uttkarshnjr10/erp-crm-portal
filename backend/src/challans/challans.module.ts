import { Module } from '@nestjs/common';
import { ChallansController } from './challans.controller';
import { ChallansService } from './challans.service';

@Module({
  controllers: [ChallansController],
  providers: [ChallansService],
  exports: [ChallansService],
})
export class ChallansModule {}
