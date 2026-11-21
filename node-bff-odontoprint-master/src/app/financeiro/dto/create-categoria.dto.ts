import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';
import { ClassificacaoDre } from '../domain/classificacao-dre.enum';
import { ClassificacaoDespesa } from '../domain/classificacao-despesa.enum';
import { SubcategoriaItemDto } from './subcategoria-item.dto';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsEnum(TipoLancamento)
  tipo: TipoLancamento;

  @IsOptional()
  @IsEnum(ClassificacaoDre)
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
