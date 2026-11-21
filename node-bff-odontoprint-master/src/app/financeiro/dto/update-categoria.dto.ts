import { IsArray, IsEnum, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { ClassificacaoDre } from '../domain/classificacao-dre.enum';
import { ClassificacaoDespesa } from '../domain/classificacao-despesa.enum';
import { SubcategoriaItemDto } from './subcategoria-item.dto';

export class UpdateCategoriaDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nome?: string;

  @IsEnum(TipoLancamento)
  @IsOptional()
  tipo?: TipoLancamento;

  @IsEnum(ClassificacaoDre)
  @IsOptional()
  classificacaoDre?: ClassificacaoDre;

  @IsOptional()
  @IsEnum(ClassificacaoDespesa)
  classificacaoDespesa?: ClassificacaoDespesa;

  @IsOptional()
  @IsInt()
  idCategoriaPai?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubcategoriaItemDto)
  subcategorias?: SubcategoriaItemDto[];
}
