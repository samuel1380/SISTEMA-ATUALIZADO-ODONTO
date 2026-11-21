import { IsNumber, IsString } from 'class-validator';

export class ItemPedidoEditarDto {
  @IsNumber()
  idProduto?: number;

  @IsNumber()
  quantidade?: number;

  @IsString()
  status?: string;
}
