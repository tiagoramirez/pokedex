import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Region extends Document {
  @Prop({
    unique: true,
    index: true,
  })
  name: string;

  @Prop()
  pokemons: number[];

  @Prop()
  numberOfPokemons: number;
}

export const RegionSchema = SchemaFactory.createForClass(Region);
