import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private readonly getAllLimit: number;
  private readonly envMode: string;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.getAllLimit = this.configService.get<number>('getAllLimit');
    this.envMode = this.configService.get<string>('environment');
  }

  async createMany(createPokemonDtos: CreatePokemonDto[]): Promise<void> {
    await this.pokemonModel.insertMany(createPokemonDtos);
  }

  async findAll(pagination: PaginationDto): Promise<Pokemon[]> {
    return await this.pokemonModel
      .find()
      .limit(pagination.limit || this.getAllLimit)
      .skip(pagination.offset || 0)
      .sort({ no: 1 })
      .select('-__v')
      .select('-_id');
  }

  async getMaxNumber(): Promise<number> {
    const maxPokemon = await this.pokemonModel.findOne({}).sort('-no').limit(1);
    if (maxPokemon === null) return 0;
    return maxPokemon.no;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel
        .findOne({ no: term })
        .select('-__v')
        .select('-_id');
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel
        .findById(term)
        .select('-__v')
        .select('-_id');
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel
        .findOne({
          name: term.toLocaleLowerCase().trim(),
        })
        .select('-__v')
        .select('-_id');
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no ${term} not found`,
      );

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    // TODO: Change to admin role
    if (this.envMode === 'prod')
      return { message: "Cannot update any pokemon in 'production' mode" };

    const pokemon = await this.findOne(term);

    try {
      if (updatePokemonDto.name) {
        const lowerCasedName = updatePokemonDto.name.toLocaleLowerCase().trim();

        await pokemon.updateOne({ ...updatePokemonDto, name: lowerCasedName });

        return {
          ...pokemon.toJSON(),
          ...updatePokemonDto,
          name: lowerCasedName,
        };
      } else {
        await pokemon.updateOne(updatePokemonDto);

        return { ...pokemon.toJSON(), ...updatePokemonDto };
      }
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  private handleExceptions(error: any) {
    if (error.code && error.code === 11000) {
      const keyError = Object.keys(error.keyValue)[0];
      const valueError = Object.values(error.keyValue)[0];
      throw new BadRequestException(
        `Pokemon with ${keyError} '${valueError}' already exists`,
      );
    } else {
      console.log('Unhandled error: ');
      console.log(error);
      throw new InternalServerErrorException(
        'Unable to process request. Check server logs',
      );
    }
  }
}
