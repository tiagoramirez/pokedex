import { HttpException, Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from '../pokemon/pokemon.service';
import { CreatePokemonDto } from '../pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from '../common/adapters/axios.adapter';
import { PokeExtraInfoResponse } from './interfaces/poke-extra-info-response.interface';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';
import { RegionService } from 'src/region/region.service';
import { CreateRegionDto } from 'src/region/dto/create-region.dto';
import { HttpStatusCode } from 'axios';

@Injectable()
export class SeedService {
  private readonly envMode: string;
  private readonly maxPokemons: number;
  private readonly kantoPage: string;
  private readonly johtoPage: string;
  private readonly hoennPage: string;
  private readonly sinnohPage: string;
  private readonly teseliaPage: string;
  private readonly kalosPage: string;
  private readonly alolaPage: string;
  private readonly galarPage: string;
  private readonly paldeaPage: string;

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: AxiosAdapter,
    private readonly configService: ConfigService,
    private readonly regionService: RegionService,
  ) {
    this.envMode = this.configService.get<string>('environment');
    this.maxPokemons = this.configService.get<number>('maxPokemons');
    this.kantoPage = this.configService.get<string>('kantoPage');
    this.johtoPage = this.configService.get<string>('johtoPage');
    this.hoennPage = this.configService.get<string>('hoennPage');
    this.sinnohPage = this.configService.get<string>('sinnohPage');
    this.teseliaPage = this.configService.get<string>('teseliaPage');
    this.kalosPage = this.configService.get<string>('kalosPage');
    this.alolaPage = this.configService.get<string>('alolaPage');
    this.galarPage = this.configService.get<string>('galarPage');
    this.paldeaPage = this.configService.get<string>('paldeaPage');
  }

  async executeSeed(): Promise<{ message: string; error?: any }> {
    // TODO: Change to admin role
    if (this.envMode === 'prod')
      return { message: "Cannot execute seed in 'production' mode" };

    await this.pokemonService.removeAll();
    await this.regionService.removeAll();

    const pokemons = await this.getPokemons();

    try {
      await this.pokemonService.createMany(pokemons);
    } catch (error) {
      console.log(error);
      return { message: 'An error occurred', error };
    }

    return { message: 'Seed executed' };
  }

  private async getPokemons(): Promise<CreatePokemonDto[]> {
    const { results: pokemonsWithoutData } = await this.http.get<PokeResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=${this.maxPokemons}`,
    );
    const regions = await this.getRegionsData();

    const promises: Promise<CreatePokemonDto>[] = [];

    for (const pokemon of pokemonsWithoutData) {
      const { name, url } = pokemon;

      const number: number = this.getNumberFromUrl(url);

      promises.push(this.getPokemonFullInfo(number, name, regions));
    }

    const pokemonsToInsert = await Promise.all(promises);

    return pokemonsToInsert;
  }

  private async getPokemonFullInfo(
    pokeNumber: number,
    pokeName: string,
    regionsWithPokemons: {
      kanto: number[];
      johto: number[];
      hoenn: number[];
      sinnoh: number[];
      teselia: number[];
      kalos: number[];
      alola: number[];
      galar: number[];
      paldea: number[];
    },
  ): Promise<CreatePokemonDto> {
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

    const regions = [];
    regionsWithPokemons.kanto.some((p) => p == pokeNumber) &&
      regions.push('kanto');
    regionsWithPokemons.johto.some((p) => p == pokeNumber) &&
      regions.push('johto');
    regionsWithPokemons.hoenn.some((p) => p == pokeNumber) &&
      regions.push('hoenn');
    regionsWithPokemons.sinnoh.some((p) => p == pokeNumber) &&
      regions.push('sinnoh');
    regionsWithPokemons.teselia.some((p) => p == pokeNumber) &&
      regions.push('teselia');
    regionsWithPokemons.kalos.some((p) => p == pokeNumber) &&
      regions.push('kalos');
    regionsWithPokemons.alola.some((p) => p == pokeNumber) &&
      regions.push('alola');
    regionsWithPokemons.galar.some((p) => p == pokeNumber) &&
      regions.push('galar');
    regionsWithPokemons.paldea.some((p) => p == pokeNumber) &&
      regions.push('paldea');

    return {
      no: pokeNumber,
      name: pokeName,
      sprites: pokemonSprites,
      types: pokemonTypes,
      regions,
    };
  }

  private getNumberFromUrl(url: string): number {
    const splittedUrl = url.split('/');
    return +splittedUrl[splittedUrl.length - 2];
  }

  private async pokemonNumbersByRegionPage(
    urlRegionPage: string,
  ): Promise<number[]> {
    const html: string = await this.http.get(urlRegionPage);

    const $ = cheerio.load(html);
    const pokemonNumbers: number[] = [];
    const tablesQuantity = $('table').length;

    $('table').each((i, table) => {
      if (i != 0 && i < tablesQuantity - 1) {
        const $table = $(table);
        $table.find('tr').each((i, row) => {
          const firstCol = $(row).find('td:first-child').text();
          if (firstCol.length > 0 || firstCol !== '\n') {
            const removedNewLine = firstCol.replace('\n', '');
            const number = parseInt(removedNewLine, 10);
            if (
              !pokemonNumbers.includes(number) &&
              number <= this.maxPokemons
            ) {
              pokemonNumbers.push(number);
            }
          }
        });
      }
    });
    return pokemonNumbers.sort((a: number, b: number) => a - b);
  }

  private async loadRegionsInDb(regionsWithPokemons: {
    kanto: number[];
    johto: number[];
    hoenn: number[];
    sinnoh: number[];
    teselia: number[];
    kalos: number[];
    alola: number[];
    galar: number[];
    paldea: number[];
  }): Promise<void> {
    const regionsToInsert: CreateRegionDto[] = [];

    regionsToInsert.push({
      name: 'kanto',
      pokemons: regionsWithPokemons.kanto,
      numberOfPokemons: regionsWithPokemons.kanto.length,
    });

    regionsToInsert.push({
      name: 'johto',
      pokemons: regionsWithPokemons.johto,
      numberOfPokemons: regionsWithPokemons.johto.length,
    });

    regionsToInsert.push({
      name: 'hoenn',
      pokemons: regionsWithPokemons.hoenn,
      numberOfPokemons: regionsWithPokemons.hoenn.length,
    });

    regionsToInsert.push({
      name: 'sinnoh',
      pokemons: regionsWithPokemons.sinnoh,
      numberOfPokemons: regionsWithPokemons.sinnoh.length,
    });

    regionsToInsert.push({
      name: 'teselia',
      pokemons: regionsWithPokemons.teselia,
      numberOfPokemons: regionsWithPokemons.teselia.length,
    });

    regionsToInsert.push({
      name: 'kalos',
      pokemons: regionsWithPokemons.kalos,
      numberOfPokemons: regionsWithPokemons.kalos.length,
    });

    regionsToInsert.push({
      name: 'alola',
      pokemons: regionsWithPokemons.alola,
      numberOfPokemons: regionsWithPokemons.alola.length,
    });

    regionsToInsert.push({
      name: 'galar',
      pokemons: regionsWithPokemons.galar,
      numberOfPokemons: regionsWithPokemons.galar.length,
    });

    regionsToInsert.push({
      name: 'paldea',
      pokemons: regionsWithPokemons.paldea,
      numberOfPokemons: regionsWithPokemons.paldea.length,
    });

    return await this.regionService.createMany(regionsToInsert);
  }

  private async getRegionsData(): Promise<{
    kanto: number[];
    johto: number[];
    hoenn: number[];
    sinnoh: number[];
    teselia: number[];
    kalos: number[];
    alola: number[];
    galar: number[];
    paldea: number[];
  }> {
    if (
      !this.kantoPage ||
      !this.johtoPage ||
      !this.hoennPage ||
      !this.sinnohPage ||
      !this.teseliaPage ||
      !this.kalosPage ||
      !this.alolaPage ||
      !this.galarPage ||
      !this.paldeaPage
    )
      throw new HttpException(
        'Missing page in environment variables',
        HttpStatusCode.NotImplemented,
      );
    const regions = {
      kanto: await this.pokemonNumbersByRegionPage(this.kantoPage),
      johto: await this.pokemonNumbersByRegionPage(this.johtoPage),
      hoenn: await this.pokemonNumbersByRegionPage(this.hoennPage),
      sinnoh: await this.pokemonNumbersByRegionPage(this.sinnohPage),
      teselia: await this.pokemonNumbersByRegionPage(this.teseliaPage),
      kalos: await this.pokemonNumbersByRegionPage(this.kalosPage),
      alola: await this.pokemonNumbersByRegionPage(this.alolaPage),
      galar: await this.pokemonNumbersByRegionPage(this.galarPage),
      paldea: await this.pokemonNumbersByRegionPage(this.paldeaPage),
    };

    await this.loadRegionsInDb(regions);

    return regions;
  }
}
