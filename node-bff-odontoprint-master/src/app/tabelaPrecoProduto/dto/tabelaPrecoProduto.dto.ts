import { IsArray, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { PrecoProdutoDto } from './precoProduto.dto';

export class TabelaPrecoProdutoDto {

  @IsOptional()
  @IsNumber()
  idTabelaPrecoProduto?: number;

  @IsString()
  nome: string;

  @IsOptional()
  @IsNumber()
  idTabelaPrecoProdutoOrigem?: number;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.idTabelaPrecoProdutoOrigem !== null && o.idTabelaPrecoProdutoOrigem !== undefined)
  numeroVersao?: string;

  @IsArray()
  precoProduto: PrecoProdutoDto[];

}
