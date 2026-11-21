import { IsString, IsOptional } from 'class-validator';

export class AtualizarAnotacoesFaturaDto {
  @IsString()
  @IsOptional()
  anotacoes?: string;
}
