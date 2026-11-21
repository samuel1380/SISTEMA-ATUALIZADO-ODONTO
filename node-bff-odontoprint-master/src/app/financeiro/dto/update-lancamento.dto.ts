import { Type } from 'class-transformer';
import { IsInt, IsOptional, ValidateIf } from 'class-validator';

export class UpdateLancamentoDto {
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsInt()
  idFornecedor?: number | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsInt()
  idCategoria?: number | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsInt()
  idClienteFornecedor?: number | null;
}

