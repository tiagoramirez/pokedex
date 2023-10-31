import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePokemonDto {
  @IsInt()
  @Min(1)
  readonly no: number;

  @IsString()
  @MinLength(1)
  readonly name: string;

  @IsArray()
  types: string[];

  sprites: Sprites;

  @IsArray()
  regions: string[];
}

class Sprites {
  @IsString()
  @IsUrl()
  front_default: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  front_female?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  front_shiny: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  front_shiny_female?: string;
}
