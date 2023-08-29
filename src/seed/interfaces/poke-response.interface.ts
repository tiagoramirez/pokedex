export interface PokeResponse {
  count: number;
  next: string;
  results: Result[];
}

export interface Result {
  name: string;
  url: string;
}
