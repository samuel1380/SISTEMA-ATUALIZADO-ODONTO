import { Exclude } from 'class-transformer';
import { IsArray, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class PrecoProdutoDto {

  @IsOptional()
  @IsNumber()
  idPrecoProduto?: number;

  @IsNumber()
  preco: number;

  @IsNumber()
  idProduto: number;

  @IsOptional()
  @IsNumber()
  idTabelaPrecoProduto?: number;

}
