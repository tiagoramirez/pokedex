import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsArray()
  pokemons: number[];

  @IsOptional()
  numberOfPokemons: number;
}
