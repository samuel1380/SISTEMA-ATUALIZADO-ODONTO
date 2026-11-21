import { IsNumber } from 'class-validator';

export class ItemPedidoCadastroDto {
  @IsNumber()
  idProduto: number;

  @IsNumber()
  quantidade: number;
}
