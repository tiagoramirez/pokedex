import { Controller, Get, Param } from '@nestjs/common';
import { RegionService } from './region.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Region } from './entities/region.entity';

@ApiTags('region')
@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  findAll(): Promise<Region[]> {
    return this.regionService.findAll();
  }

  @Get(':name')
  @ApiParam({ name: 'name', example: 'kanto' })
  findOne(@Param('name') name: string): Promise<Region> {
    return this.regionService.findOne(name);
  }
}
