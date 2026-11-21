import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoVinculo } from '../domain/conciliacao-transacao.entity';

export class VincularConciliacaoDto {
  @IsInt()
  @IsNotEmpty()
  idTransacaoOfx: number;

  @IsEnum(TipoVinculo)
  @IsNotEmpty()
  tipoVinculo: TipoVinculo;

  @IsOptional()
  @IsInt()
  idMovimentacao?: number;

  @IsOptional()
  @IsInt()
  idAporte?: number;

  @IsOptional()
  @IsInt()
  idRetirada?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
