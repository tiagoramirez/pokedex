import { Module } from '@nestjs/common';
import { RegionService } from './region.service';
import { RegionController } from './region.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Region, RegionSchema } from './entities/region.entity';

@Module({
  controllers: [RegionController],
  providers: [RegionService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Region.name,
        schema: RegionSchema,
      },
    ]),
  ],
  exports: [RegionService],
})
export class RegionModule {}
