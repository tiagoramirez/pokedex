import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from '../pokemon/pokemon.service';
import { CreatePokemonDto } from '../pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from '../common/adapters/axios.adapter';
import { PokeExtraInfoResponse } from './interfaces/poke-extra-info-response.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
  private readonly envMode: string;
  private readonly logEnabled: boolean;
  private readonly maxPokemons: number;

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: AxiosAdapter,
    private readonly configService: ConfigService,
  ) {
    this.envMode = this.configService.get<string>('environment');
    this.logEnabled = this.configService.get<boolean>('logEnabled');
    this.maxPokemons = this.configService.get<number>('maxPokemons');
  }

  async executeSeed() {
    // TODO: Change to admin role
    if (this.envMode === 'prod')
      return { message: "Cannot execute seed in 'production' mode" };

    const pokemons = await this.getPokemons();

    try {
      await this.pokemonService.createMany(pokemons);
    } catch (error) {
      console.log(error);
    }

    return { message: 'Seed executed' };
  }

  private async getPokemons() {
    const { results } = await this.http.get<PokeResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=${this.maxPokemons}`,
    );

    const promises: Promise<CreatePokemonDto>[] = [];

    for (const pokemon of results) {
      const { name, url } = pokemon;

      const number: number = this.getNumberFromUrl(url);

      promises.push(this.getPokemonFullInfo(number, name));
    }

    const pokemonsToInsert = await Promise.all(promises);

    return pokemonsToInsert;
  }

  private async getPokemonFullInfo(
    pokeNumber: number,
    pokeName: string,
  ): Promise<CreatePokemonDto> {
    const { sprites, types } = await this.http.get<PokeExtraInfoResponse>(
      `https://pokeapi.co/api/v2/pokemon-form/${pokeNumber}`,
    );

    if (this.logEnabled)
      console.log(`Searched extra info for pokemon number: ${pokeNumber}`);

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

    return {
      no: pokeNumber,
      name: pokeName,
      sprites: pokemonSprites,
      types: pokemonTypes,
    };
  }

  private getNumberFromUrl(url: string): number {
    const splittedUrl = url.split('/');
    return +splittedUrl[splittedUrl.length - 2];
  }
}
