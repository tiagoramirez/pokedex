import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class SeedDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  readonly limit?: number;
}
