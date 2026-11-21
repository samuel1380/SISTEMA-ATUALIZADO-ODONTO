import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ItemPedidoCadastroDto } from './itemPedidoCadastro.dto';

export class PedidoCadastroDto {
  @IsOptional()
  @IsString()
  idUsuarioSolicitante?: string;

  @IsArray()
  itemsPedido: ItemPedidoCadastroDto[];

}
