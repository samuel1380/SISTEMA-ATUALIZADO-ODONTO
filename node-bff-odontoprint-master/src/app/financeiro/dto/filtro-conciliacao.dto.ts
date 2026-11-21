import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoTransacaoOfx, StatusConciliacao } from '../domain/transacao-ofx.entity';

export class FiltroConciliacaoDto {
  @IsOptional()
  @IsInt()
  idConta?: number;

  @IsOptional()
  @IsString()
  dataInicio?: string;

  @IsOptional()
  @IsString()
  dataFim?: string;

  @IsOptional()
  @IsEnum(TipoTransacaoOfx)
  tipo?: TipoTransacaoOfx;

  @IsOptional()
  @IsEnum(StatusConciliacao)
  statusConciliacao?: StatusConciliacao;

  @IsOptional()
  @IsNumber()
  valorMin?: number;

  @IsOptional()
  @IsNumber()
  valorMax?: number;
}
