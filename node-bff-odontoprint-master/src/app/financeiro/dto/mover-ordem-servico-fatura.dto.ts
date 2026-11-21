import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class MoverOrdemServicoFaturaDto {
  @IsInt()
  @IsNotEmpty()
  idOrdemServico: number;

  @IsInt()
  @IsNotEmpty()
  idEmpresa: number;

  @IsInt()
  @IsOptional()
  idFaturaDestino?: number;

  @IsInt()
  @IsOptional()
  anoDestino?: number;

  @IsInt()
  @IsOptional()
  mesDestino?: number; // 1-12
}
