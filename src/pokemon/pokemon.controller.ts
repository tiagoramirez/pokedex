import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.pokemonService.findAll(paginationDto);
  }

  @Get(':term')
  @ApiParam({ name: 'term', example: 'pikachu or 25' })
  findOne(@Param('term') term: string) {
    return this.pokemonService.findOne(term);
  }

  @Post('random')
  @ApiQuery({ name: 'limit', required: false })
  getRandom(@Query() paginationDto: PaginationDto) {
    return this.pokemonService.getRandomPokemon(paginationDto);
  }
}
