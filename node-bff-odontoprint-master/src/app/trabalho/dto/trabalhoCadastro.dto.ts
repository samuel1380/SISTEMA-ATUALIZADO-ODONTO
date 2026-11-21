import { IsNumber, IsString, IsArray, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { ElementosTrabalhoDto } from './elementosTrabalho.dto';
import { ComponenteDto } from '@src/app/componente/dto/componente.dto';
import { Type } from 'class-transformer';

export class ServicoTrabalhoCadastroDto {
  @IsOptional()
  @IsNumber()
  idServicoTrabalho: number;

  @IsNumber()
  idProduto: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ElementosTrabalhoDto)
  elementos: ElementosTrabalhoDto[];
}

export class TrabalhoCadastroDto {
  @IsOptional()
  @IsNumber()
  idPaciente?: number;

  @IsOptional()
  @IsNumber()
  idEmpresa: number;

  @IsOptional()
  @IsNumber()
  idProfissional: number;

  @ValidateNested({ each: true })
  @Type(() => ServicoTrabalhoCadastroDto)
  servicos: ServicoTrabalhoCadastroDto[];
  
  @IsString()
  cor: string;

  @IsArray()
  componentes: ComponenteDto[];

  @IsString()
  observacao: string;

  @IsOptional()
  @IsString()
  anotacoes?: string;

  @IsOptional()
  @IsBoolean()
  retrabalho?: boolean;

  @IsOptional()
  @IsBoolean()
  bonificacao?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  motivosRetrabalhoIds?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  motivosBonificacaoIds?: number[];
}
