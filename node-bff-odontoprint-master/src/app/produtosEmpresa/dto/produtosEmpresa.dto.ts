import { IsNumber, IsOptional } from 'class-validator';

export class ProdutoEmpresaDto {

  @IsOptional()
  @IsNumber()
  idProdutoEmpresa?: number;

  @IsNumber()
  idProduto: number;

}
