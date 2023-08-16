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

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    const lowerCasedName = createPokemonDto.name.toLocaleLowerCase().trim();
    const pokemonToInsert = {
      ...createPokemonDto,
      name: lowerCasedName,
    };
    try {
      const pokemon = await this.pokemonModel.create(pokemonToInsert);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLocaleLowerCase().trim(),
      });
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no ${term} not found`,
      );

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
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

  async remove(id: string) {
    // // const pokemon = await this.findOne(id);
    // // await pokemon.deleteOne();

    // const result = await this.pokemonModel.findByIdAndDelete(id);

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new NotFoundException(`Pokemon whith id "${id}" not found`);
    return { message: `Pokemon with id "${id}" was deleted.` };
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
        "Can't create pokemon. Check server logs",
      );
    }
  }
}
