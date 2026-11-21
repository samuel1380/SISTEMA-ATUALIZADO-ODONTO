import { IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AtualizarEmpresaTabelaPrecoDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  idTabelaPrecoProduto?: number;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string | null;
}
