import { Controller, Get, Query } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false })
  executeSeed(@Query() paginationDto: PaginationDto) {
    return this.seedService.executeSeed(paginationDto);
  }
}
