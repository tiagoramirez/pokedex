import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  readonly limit?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly offset?: number;
}
