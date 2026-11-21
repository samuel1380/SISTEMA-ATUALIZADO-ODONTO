import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CriarEmpresaTabelaPrecoDto {
  @IsNumber()
  idEmpresa: number;

  @IsNumber()
  idTabelaPrecoProduto: number;

  @IsDateString()
  dataInicio: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
