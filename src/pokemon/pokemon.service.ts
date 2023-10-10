import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { getRandomInt } from '../common/functions/getRandomNumber';

@Injectable()
export class PokemonService {
  private readonly getAllLimit: number;
  private totalPokemons: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.getAllLimit = this.configService.get<number>('getAllLimit');
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

  async getMaxNumber(): Promise<number> {
    const maxPokemon = await this.pokemonModel.findOne({}).sort('-no').limit(1);
    if (maxPokemon === null) return 0;
    return maxPokemon.no;
  }

  async getRandomPokemon({ limit = 1 }: PaginationDto): Promise<Pokemon[]> {
    if (this.totalPokemons == null || this.totalPokemons == undefined)
      this.totalPokemons = await this.getMaxNumber();
    const pokemons: Pokemon[] = [];
    for (let i = 0; i < limit; i++) {
      const randomNumber: number = getRandomInt(1, this.totalPokemons);
      const pokemon = await this.findOne('' + randomNumber);
      pokemons.push(pokemon);
    }
    return pokemons;
  }
}
