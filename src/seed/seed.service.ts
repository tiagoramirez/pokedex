import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from '../pokemon/pokemon.service';
import { CreatePokemonDto } from '../pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from '../common/adapters/axios.adapter';
import { PokeExtraInfoResponse } from './interfaces/poke-extra-info-response.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
  private readonly initialPokemons: number;
  private readonly envMode: string;

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: AxiosAdapter,
    private readonly configService: ConfigService,
  ) {
    this.initialPokemons = this.configService.get<number>('maxPokemonSeed');
    this.envMode = this.configService.get<string>('environment');
  }

  async executeSeed() {
    if (this.envMode === 'prod')
      return { message: "Cannot execute seed in 'production' mode" };

    await this.pokemonService.removeAll();

    const pokemons = await this.getPokemons();

    try {
      await this.pokemonService.createMany(pokemons);
    } catch (error) {
      console.log(error);
    }

    return { message: 'Seed executed' };
  }

  private async getPokemons(): Promise<CreatePokemonDto[]> {
    const pokemonsToInsert: CreatePokemonDto[] = [];

    const { results } = await this.http.get<PokeResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=${this.initialPokemons}`,
    );

    for (const pokemon of results) {
      const { name, url } = pokemon;

      const number: number = this.getNumberFromUrl(url);

      const extraPokemonInfo = await this.getPokemonExtraInfo(number);

      pokemonsToInsert.push({
        ...extraPokemonInfo,
        name: name.toLocaleLowerCase(),
        no: number,
      });
    }

    return pokemonsToInsert;
  }

  private async getPokemonExtraInfo(pokeNumber: number) {
    const { sprites, types } = await this.http.get<PokeExtraInfoResponse>(
      `https://pokeapi.co/api/v2/pokemon-form/${pokeNumber}`,
    );
    const pokemonSprites = {
      front_default: sprites.front_default,
      front_female: sprites.front_female,
      front_shiny: sprites.front_shiny,
      front_shiny_female: sprites.front_shiny_female,
    };

    const pokemonTypes = [];
    types.forEach(({ type }) => {
      pokemonTypes.push(type.name);
    });

    return { sprites: pokemonSprites, types: pokemonTypes };
  }

  private getNumberFromUrl(url: string) {
    const splittedUrl = url.split('/');
    return +splittedUrl[splittedUrl.length - 2];
  }
}
