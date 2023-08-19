import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from '../pokemon/pokemon.service';
import { CreatePokemonDto } from '../pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from '../common/adapters/axios.adapter';

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

      pokemonsToInsert.push({ name: name.toLocaleLowerCase(), no: number });
    });

    await this.pokemonService.createMany(pokemonsToInsert);

    return { message: 'Seed executed' };
  }
}
