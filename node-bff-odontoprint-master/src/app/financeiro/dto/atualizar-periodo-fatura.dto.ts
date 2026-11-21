import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AtualizarPeriodoFaturaDto {
  @IsString()
  @IsNotEmpty()
  dataInicio: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  dataFim: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  dataVencimento: string; // YYYY-MM-DD

  @IsString()
  @IsOptional()
  motivo?: string;
}
