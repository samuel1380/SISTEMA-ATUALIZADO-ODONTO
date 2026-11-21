import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum MotivoTipo {
  RETRABALHO = 'RETRABALHO',
  BONIFICACAO = 'BONIFICACAO',
}

export class MotivoDto {
  @IsOptional()
  @IsNumber()
  idMotivo?: number;

  @IsString()
  nome: string;

  @IsEnum(MotivoTipo)
  tipo: MotivoTipo;
}

