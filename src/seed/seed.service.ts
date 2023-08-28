import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from '../pokemon/pokemon.service';
import { CreatePokemonDto } from '../pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from '../common/adapters/axios.adapter';
import { PokeImgResponse } from './interfaces/poke-img-response.interface';

@Injectable()
export class SeedService {
  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: AxiosAdapter,
  ) {}

  private readonly initialPokemons = 650;

  async executeSeed() {
    await this.pokemonService.removeAll();

    const data = await this.http.get<PokeResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=${this.initialPokemons}`,
    );

    const pokemonsToInsert: CreatePokemonDto[] = [];

    data.results.forEach(async (pokemon) => {
      const { name, url } = pokemon;

      const splittedUrl = url.split('/');

      const number: number = +splittedUrl[splittedUrl.length - 2];

      const { sprites, types } = await this.http.get<PokeImgResponse>(
        `https://pokeapi.co/api/v2/pokemon-form/${number}`,
      );

      const pokemonSprites = {
        front_default: sprites.front_default,
        front_female: sprites.front_female,
        front_shiny: sprites.front_shiny,
        front_shiny_female: sprites.front_shiny_female,
      };

      const pokemonTypes = [];
      types.forEach(({ type }) => {
        pokemonTypes.push(type);
      });

      pokemonsToInsert.push({
        name: name.toLocaleLowerCase(),
        no: number,
        types: pokemonTypes,
        sprites: pokemonSprites,
      });
    });

    await this.pokemonService.createMany(pokemonsToInsert);

    return { message: 'Seed executed' };
  }
}
