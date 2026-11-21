import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { StatusOrdemServico } from '../domain/ordemServico.entity';

class OrdemServicoItemDto {
  @IsOptional()
  @IsInt()
  idOrdemServicoItem?: number;

  @IsInt()
  @IsNotEmpty()
  idReferencia: number;

  @IsString()
  @IsNotEmpty()
  tipoCobranca: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @IsInt()
  @IsNotEmpty()
  quantidade: number;

  @IsNumber()
  @IsNotEmpty()
  valorTotal: number;
}

export class OrdemServicoDto {
  @IsOptional()
  @IsInt()
  idOrdemServico?: number;

  @IsInt()
  @IsNotEmpty()
  idTrabalho: number;

  @IsInt()
  @IsNotEmpty()
  idEmpresa: number;

  @IsEnum(StatusOrdemServico)
  @IsNotEmpty()
  status: StatusOrdemServico;

  @IsNumber()
  @IsNotEmpty()
  valorTotal: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrdemServicoItemDto)
  itens?: OrdemServicoItemDto[];
}
