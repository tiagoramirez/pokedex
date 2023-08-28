export interface PokeImgResponse {
  form_name: string;
  form_names: any[];
  form_order: number;
  id: number;
  is_battle_only: boolean;
  is_default: boolean;
  is_mega: boolean;
  name: string;
  names: any[];
  order: number;
  pokemon: Pokemon;
  sprites: Sprites;
  types: Type[];
  version_group: Pokemon;
}

export interface Pokemon {
  name: string;
  url: string;
}

export interface Sprites {
  back_default: string;
  back_female?: string;
  back_shiny: string;
  back_shiny_female?: string;
  front_default: string;
  front_female?: string;
  front_shiny: string;
  front_shiny_female?: string;
}

export interface Type {
  slot: number;
  type: Pokemon;
}
