import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Pokemon extends Document {
  @Prop({
    unique: true,
    index: true,
  })
  name: string;

  @Prop({
    unique: true,
    index: true,
  })
  no: number;

  types: string[];

  sprites: Sprites;
}

interface Sprites {
  front_default: string;
  front_female?: string;
  front_shiny: string;
  front_shiny_female?: string;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
