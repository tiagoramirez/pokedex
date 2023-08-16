import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  private readonly initialPokemons = 10;

  async executeSeed() {
    const { data } = await this.axios.get<PokeResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=${this.initialPokemons}`,
    );

    data.results.forEach((pokemon) => {
      const { name, url } = pokemon;
      const splittedUrl = url.split('/');
      const number: number = +splittedUrl[splittedUrl.length - 2];
      console.log({ name, no: number });
    });

    return { message: 'Seed executed' };
  }
}
