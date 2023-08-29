import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PokemonModule } from '../pokemon/pokemon.module';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [PokemonModule, CommonModule, ConfigModule],
})
export class SeedModule {}
