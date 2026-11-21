import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { CustomProdutoCadastroDto } from './customProdutoCadastro.dto'

export class ProdutoCadastroDto {
  @IsString()
  nome: string;

  @IsNumber()
  prazoEntregaDias: number;

  @IsNumber()
  precoCusto?: number;

  @IsNumber()
  preco: number;

  @IsNumber()
  idCategoriaProduto: number;

  @IsBoolean()
  ativo: Boolean;

  @IsOptional()
  @IsArray()
  customProduto?: CustomProdutoCadastroDto[]

}
