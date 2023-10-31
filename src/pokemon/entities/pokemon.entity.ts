import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Sprites } from './sprites.entity';

@Schema()
export class Pokemon extends Document {
  @Prop({
    unique: true,
    index: true,
  })
  no: number;

  @Prop({
    unique: true,
    index: true,
  })
  name: string;

  @Prop()
  types: string[];

  @Prop()
  sprites: Sprites;

  @Prop({
    index: true,
  })
  regions: string[];
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
